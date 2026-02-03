from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/projects/{project_id}/versions", tags=["Versions"])

def get_project_or_404(project_id: int, user_id: int, db: Session):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("", response_model=List[schemas.VersionResponse])
async def get_versions(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    versions = db.query(models.Version).filter(
        models.Version.project_id == project_id
    ).order_by(models.Version.version_number.desc()).all()
    
    result = []
    for version in versions:
        result.append({
            "id": version.id,
            "version_number": version.version_number,
            "note": version.note,
            "is_current": version.is_current,
            "created_at": version.created_at,
            "file_count": len(version.files)
        })
    
    return result

@router.post("/{version_id}/restore", response_model=schemas.VersionResponse)
async def restore_version(
    project_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    version = db.query(models.Version).filter(
        models.Version.id == version_id,
        models.Version.project_id == project_id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Mark all versions as not current
    db.query(models.Version).filter(
        models.Version.project_id == project_id
    ).update({"is_current": False})
    
    # Set restored version as current
    version.is_current = True
    project.updated_at = datetime.utcnow()
    
    # Log activity
    activity = models.Activity(
        type="restore",
        action=f"Restored to version v{version.version_number} of",
        project_name=project.name,
        user_id=current_user.id
    )
    db.add(activity)
    
    db.commit()
    db.refresh(version)
    
    return {
        "id": version.id,
        "version_number": version.version_number,
        "note": version.note,
        "is_current": version.is_current,
        "created_at": version.created_at,
        "file_count": len(version.files)
    }
