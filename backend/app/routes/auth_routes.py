from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
import os
import shutil
import uuid
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from ..limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
@limiter.limit("5/minute")
async def register(request: Request, user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = auth.get_password_hash(user_data.password)
    user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token (sub must be a string for jose JWT)
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
async def login(request: Request, form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/profile", response_model=schemas.UserResponse)
async def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
async def update_profile(
    profile_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if email is being changed and if it's already taken
    if profile_data.email and profile_data.email != current_user.email:
        existing = db.query(models.User).filter(models.User.email == profile_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_data.email
    
    if profile_data.name:
        current_user.name = profile_data.name
        
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.company is not None:
        current_user.company = profile_data.company
    if profile_data.location is not None:
        current_user.location = profile_data.location
    if profile_data.twitter_username is not None:
        current_user.twitter_username = profile_data.twitter_username
    if profile_data.github_username is not None:
        current_user.github_username = profile_data.github_username
    if profile_data.profile_picture_url is not None:
        current_user.profile_picture_url = profile_data.profile_picture_url
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password")
async def change_password(
    password_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify current password
    if not auth.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = auth.get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.post("/profile/avatar", response_model=schemas.UserResponse)
@limiter.limit("5/minute")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        file_extension = ".png" # fallback
        
    secure_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join("uploads", "avatars", secure_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Relative path from frontend API base
    url_path = f"/api/uploads/avatars/{secure_filename}"
    
    # Actually wait, FASTAPI is mounting to /uploads. Let's use the absolute path backend root relative url.
    # Frontend proxy usually passes through or handles backend requests.
    # A safer approach is to respond with the path that can be requested from the backend.
    # In ProjectVault, backend is http://localhost:8000, so we just return the path relative to host
    url_path = f"/uploads/avatars/{secure_filename}"
    
    current_user.profile_picture_url = url_path
    db.commit()
    db.refresh(current_user)
    
    return current_user

import firebase_admin
from firebase_admin import auth as firebase_auth
import uuid

@router.post("/google-login", response_model=schemas.Token)
@limiter.limit("10/minute")
async def google_login(request: Request, form_data: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Verify Firebase ID token
        decoded_token = firebase_auth.verify_id_token(form_data.id_token, clock_skew_seconds=60)
        email = decoded_token.get("email")
        name = decoded_token.get("name", email.split("@")[0] if email else "User")
        picture = decoded_token.get("picture")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in token"
            )
            
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Create a new user with a strong randomized password
            # since hashed_password is not nullable in our DB
            random_password = str(uuid.uuid4()) + str(uuid.uuid4())
            hashed_password = auth.get_password_hash(random_password)
            
            user = models.User(
                name=name,
                email=email,
                hashed_password=hashed_password,
                profile_picture_url=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # If user exists but has no picture, and Google provides one, update it.
            if picture and not user.profile_picture_url:
                user.profile_picture_url = picture
                db.commit()
                db.refresh(user)
            
        # Create access token for the session
        access_token = auth.create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    except Exception as e:
        # Avoid overriding an HTTPException that we explicitly raised
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase authentication token: {str(e)}"
        )

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    import uuid
    from datetime import datetime, timedelta
    
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        # We don't want to expose which emails exist, just return success
        return {"message": "If an account with that email exists, we have generated a reset link"}

    # Generate a secure token and set expiration to 15 mins from now
    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    # MAGIC EMAIL MOCK
    # Normally we email this token. Since we don't have SMTP, we are returning it 
    # to the frontend mock so it can display the UI link for Academic Demo purposes.
    return {
        "message": "If an account with that email exists, we have generated a reset link",
        "mock_magic_link_token": token
    }

@router.post("/reset-password")
@limiter.limit("3/minute")
async def reset_password(request: Request, req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    from datetime import datetime
    
    user = db.query(models.User).filter(models.User.reset_token == req.token).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Reset security credentials
    user.hashed_password = auth.get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password has been successfully reset"}

