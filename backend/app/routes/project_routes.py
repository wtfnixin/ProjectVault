from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[schemas.ProjectResponse])
async def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    projects = db.query(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).order_by(models.Project.updated_at.desc()).all()
    
    # Add file and version counts
    result = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "color": project.color,
            "owner_id": project.owner_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "file_count": len(project.files),
            "version_count": len(project.versions)
        }
        result.append(project_dict)
    
    return result

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "color": project.color,
        "owner_id": project.owner_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "file_count": len(project.files),
        "version_count": len(project.versions)
    }

@router.post("", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = models.Project(
        name=project_data.name,
        description=project_data.description,
        color=project_data.color,
        owner_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Log activity
    activity = models.Activity(
        type="create",
        action=f"Created new project",
        project_name=project.name,
        user_id=current_user.id
    )
    db.add(activity)
    db.commit()
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "color": project.color,
        "owner_id": project.owner_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "file_count": 0,
        "version_count": 0
    }

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
async def update_project(
    project_id: int,
    project_data: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_data.name is not None:
        project.name = project_data.name
    if project_data.description is not None:
        project.description = project_data.description
    if project_data.color is not None:
        project.color = project_data.color
    
    db.commit()
    db.refresh(project)
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "color": project.color,
        "owner_id": project.owner_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "file_count": len(project.files),
        "version_count": len(project.versions)
    }

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Log activity
    activity = models.Activity(
        type="delete",
        action=f"Deleted project",
        project_name=project.name,
        user_id=current_user.id
    )
    db.add(activity)
    
    db.delete(project)
    db.commit()
