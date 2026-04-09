from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    company = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    twitter_username = Column(String(50), nullable=True)
    github_username = Column(String(50), nullable=True)
    reset_token = Column(String(255), unique=True, index=True, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    readme = Column(Text, nullable=True)
    color = Column(String(20), default="#0c87eb")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="projects")
    versions = relationship("Version", back_populates="project", cascade="all, delete-orphan")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")

class Version(Base):
    __tablename__ = "versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version_number = Column(Integer, nullable=False)
    note = Column(Text)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    is_current = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="versions")
    files = relationship("VersionFile", back_populates="version", cascade="all, delete-orphan")

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    size = Column(Integer, nullable=False)
    mime_type = Column(String(100))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="files")

class VersionFile(Base):
    __tablename__ = "version_files"
    
    id = Column(Integer, primary_key=True, index=True)
    version_id = Column(Integer, ForeignKey("versions.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    
    version = relationship("Version", back_populates="files")
    file = relationship("File")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # upload, version, restore, create, delete
    action = Column(String(255), nullable=False)
    project_name = Column(String(200))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    details = Column(Text)  # JSON string for detailed tracking (added, modified, deleted)
    
    user = relationship("User", back_populates="activities")
