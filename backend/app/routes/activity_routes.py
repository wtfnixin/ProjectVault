from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/activity", tags=["Activity"])

@router.get("", response_model=List[schemas.ActivityResponse])
async def get_activities(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    activities = db.query(models.Activity).filter(
        models.Activity.user_id == current_user.id
    ).order_by(models.Activity.created_at.desc()).limit(limit).all()
    
    return activities

@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Count projects
    project_count = db.query(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).count()
    
    # Count files
    file_count = db.query(models.File).join(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).count()
    
    # Count versions
    version_count = db.query(models.Version).join(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).count()
    
    # Calculate storage (sum of file sizes)
    from sqlalchemy import func
    storage = db.query(func.sum(models.File.size)).join(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).scalar() or 0
    
    return {
        "total_projects": project_count,
        "total_files": file_count,
        "total_versions": version_count,
        "storage_used": storage
    }

@router.get("/heatmap")
async def get_activity_heatmap(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    one_year_ago = datetime.utcnow() - timedelta(days=365)
    
    # SQLite compatible date grouping
    results = db.query(
        func.date(models.Activity.created_at).label('date'),
        func.count(models.Activity.id).label('count')
    ).filter(
        models.Activity.user_id == current_user.id,
        models.Activity.created_at >= one_year_ago
    ).group_by(
        func.date(models.Activity.created_at)
    ).all()
    
    # Map to dictionary { "YYYY-MM-DD": count }
    return {str(row.date): row.count for row in results}

@router.delete("")
async def clear_activity_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db.query(models.Activity).filter(
        models.Activity.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Activity history cleared"}
