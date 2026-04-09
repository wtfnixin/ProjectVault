from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any, Dict
import json
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    twitter_username: Optional[str] = None
    github_username: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    id_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    twitter_username: Optional[str] = None
    github_username: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#0c87eb"
    readme: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    readme: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    file_count: Optional[int] = 0
    version_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# File schemas
class FileResponse(BaseModel):
    id: int
    name: str
    original_name: str
    size: int
    mime_type: Optional[str]
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Version schemas
class VersionCreate(BaseModel):
    note: Optional[str] = None

class VersionResponse(BaseModel):
    id: int
    version_number: int
    note: Optional[str]
    is_current: bool
    created_at: datetime
    file_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Activity schemas
class ActivityResponse(BaseModel):
    id: int
    type: str
    action: str
    project_name: Optional[str]
    details: Optional[Any] = None
    created_at: datetime
    
    @field_validator('details', mode='before')
    @classmethod
    def parse_details(cls, v):
        if isinstance(v, str) and v:
            try:
                return json.loads(v)
            except:
                return v
        return v
    
    class Config:
        from_attributes = True
