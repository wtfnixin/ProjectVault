from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
import zipfile
import json
from datetime import datetime
from .. import models, schemas, auth
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/api/projects/{project_id}", tags=["Files"])

def get_project_or_404(project_id: int, user_id: int, db: Session):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/files", response_model=List[schemas.FileResponse])
async def get_files(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    current_version = db.query(models.Version).filter(
        models.Version.project_id == project_id,
        models.Version.is_current == True
    ).first()
    
    if not current_version:
        return []
        
    return [vf.file for vf in current_version.files]

@router.post("/upload", response_model=schemas.VersionResponse)
async def upload_files(
    project_id: int,
    files: List[UploadFile] = File(...),
    version_note: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    # Get current version before marking as not current
    current_version = db.query(models.Version).filter(
        models.Version.project_id == project_id,
        models.Version.is_current == True
    ).first()

    # Identify files to carry over (files from current version that are NOT in the new upload)
    files_to_carry_over = []
    uploaded_filenames = {os.path.basename(f.filename.replace("\\", "/")) for f in files}
    
    if current_version:
        # Check if any uploaded file matches an existing file in the current version
        # If so, version_note is REQUIRED to give context for the update
        overwriting_files = False
        for vf in current_version.files:
            if vf.file.original_name in uploaded_filenames:
                overwriting_files = True
                break
        
        if overwriting_files and not version_note:
            raise HTTPException(
                status_code=400, 
                detail="Version note is required when updating existing files"
            )

        for vf in current_version.files:
            # If the file is NOT being replaced by a new upload, carry it over
            if vf.file.original_name not in uploaded_filenames:
                files_to_carry_over.append(vf.file)

    # Get existing filenames just for tracking added/modified status logic
    # (This logic tracks what happened in THIS specific upload action)
    existing_files_query = db.query(models.File).filter(
        models.File.project_id == project_id
    ).all()
    all_existing_names = {f.original_name for f in existing_files_query}
    
    added_files = []
    modified_files = []
    
    # Create project upload directory
    project_dir = os.path.join(settings.UPLOAD_DIR, str(project_id))
    os.makedirs(project_dir, exist_ok=True)
    
    # Mark previous versions as not current
    db.query(models.Version).filter(
        models.Version.project_id == project_id
    ).update({"is_current": False})
    
    # Create new version
    version_count = db.query(models.Version).filter(
        models.Version.project_id == project_id
    ).count()
    
    version = models.Version(
        version_number=version_count + 1,
        note=version_note,
        project_id=project_id,
        is_current=True
    )
    db.add(version)
    db.commit()
    db.refresh(version)

    # Link carried-over files to new version
    for file_obj in files_to_carry_over:
        version_file = models.VersionFile(
            version_id=version.id,
            file_id=file_obj.id
        )
        db.add(version_file)
    
    # Save and link new files
    saved_files = []
    # We count carried over files as "saved" for the response count, 
    # but the API response typically expects the files *in this version*.
    # Actually client might expect just the *new* files if it's an upload response? 
    # But usually a version response includes file_count of the WHOLE version.
    
    for file in files:
        safe_filename = os.path.basename(file.filename.replace("\\", "/"))
        # Generate unique filename details for activity log
        if safe_filename in all_existing_names:
            modified_files.append(safe_filename)
        else:
            added_files.append(safe_filename)
            all_existing_names.add(safe_filename)
            
        ext = os.path.splitext(safe_filename)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(project_dir, unique_name)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create file record
        file_record = models.File(
            name=unique_name,
            original_name=safe_filename,
            path=file_path,
            size=len(content),
            mime_type=file.content_type,
            project_id=project_id
        )
        db.add(file_record)
        db.commit()
        db.refresh(file_record)
        saved_files.append(file_record)
        
        # Link to version
        version_file = models.VersionFile(
            version_id=version.id,
            file_id=file_record.id
        )
        db.add(version_file)
    
    # Update project timestamp
    project.updated_at = datetime.utcnow()
    
    # Log activity
    details = {
        "added": added_files,
        "modified": modified_files,
        "deleted": []
    }
    
    activity = models.Activity(
        type="upload",
        action=f"Uploaded {len(files)} file(s) to",
        project_name=project.name,
        user_id=current_user.id,
        details=json.dumps(details)
    )
    db.add(activity)
    
    activity2 = models.Activity(
        type="version",
        action=f"Created version v{version.version_number} of",
        project_name=project.name,
        user_id=current_user.id
    )
    db.add(activity2)
    
    db.commit()
    
    # Total files in this version is carried_over + new_uploads
    total_file_count = len(files_to_carry_over) + len(saved_files)

    return {
        "id": version.id,
        "version_number": version.version_number,
        "note": version.note,
        "is_current": version.is_current,
        "created_at": version.created_at,
        "file_count": total_file_count
    }

@router.get("/download")
async def download_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    if not project.files:
        raise HTTPException(status_code=404, detail="No files to download")
    
    # Create zip file
    zip_path = os.path.join(settings.UPLOAD_DIR, f"{project.name}_{project_id}.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in project.files:
            if os.path.exists(file.path):
                zipf.write(file.path, file.original_name)
    
    # Log activity
    activity = models.Activity(
        type="download",
        action=f"Downloaded all files from",
        project_name=project.name,
        user_id=current_user.id
    )
    db.add(activity)
    db.commit()
    
    return FileResponse(
        zip_path,
        filename=f"{project.name}.zip",
        media_type="application/zip"
    )

@router.get("/files/{file_id}/download")
async def download_file(
    project_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.project_id == project_id
    ).first()
    
    if not file or not os.path.exists(file.path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file.path,
        filename=file.original_name,
        media_type=file.mime_type
    )

@router.delete("/files/{file_id}", status_code=204)
async def delete_file(
    project_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.project_id == project_id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete references from versions first to prevent foreign key constraint errors
    db.query(models.VersionFile).filter(models.VersionFile.file_id == file_id).delete(synchronize_session=False)

    # Delete physical file
    if os.path.exists(file.path):
        os.remove(file.path)
    
    # Log activity
    details = {
        "added": [],
        "modified": [],
        "deleted": [file.original_name]
    }
    
    activity = models.Activity(
        type="delete",
        action=f"Deleted {file.original_name} from",
        project_name=project.name,
        user_id=current_user.id,
        details=json.dumps(details)
    )
    db.add(activity)
    
    db.delete(file)
    db.commit()
