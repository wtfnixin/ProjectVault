# ProjectVault  
## An Academic Project Backup and Versioning System

---

## Project Overview

ProjectVault is a student-focused academic project management system designed to automatically maintain project version history and enable easy recovery of previous project states.

Students frequently work on digital academic projects such as reports, presentations, documentation, and coding assignments. These projects undergo multiple revisions. However, students usually manage them using basic folders or simple cloud storage solutions, which leads to problems such as overwriting files, losing older versions, confusion between multiple copies, and lack of structured project history.

Although tools like Git and GitHub provide version control, they are primarily designed for professional software developers. They require technical knowledge of Git workflows and are optimized mainly for source-code management. As a result, many students find them complex and unsuitable for managing complete academic projects.

ProjectVault aims to bridge this gap by providing a simple, academic-oriented platform that focuses on usability, visual history tracking, and easy recovery rather than developer-centric workflows.

---

## Objectives

- Provide a centralized platform for managing academic projects  
- Automatically maintain structured project version history  
- Prevent accidental data loss and file overwriting  
- Enable easy comparison between project versions  
- Allow one-click restoration of previous project states  
- Support both web and mobile access  

---

## Core Features

### 1. User Authentication
- User registration and login  
- Secure authentication using JWT  
- Session and profile management  

### 2. Project Management
- Create, view, update, and delete projects  
- Each project acts as a container for related files  

### 3. File Upload and Management
- Upload multiple files and folders  
- Support common academic file formats (PDF, DOC, PPT, code files, etc.)  
- Download files from any project version  

### 4. Automatic Version Creation
- Every project update creates a new version automatically  
- Version numbering (v1, v2, v3, etc.)  
- Timestamp and optional version description  
- Previous versions are never overwritten  

### 5. Version History
- Visual list or timeline of all project versions  
- Display version number, date, and description  
- Easy navigation across older versions  

### 6. Version Comparison
- Compare two selected versions  
- Show added, modified, and removed files  
- Provide a clear summary of changes  

### 7. Restore and Recovery
- Restore any previous version with a single action  
- Restored versions are also recorded in version history  

### 8. Activity Log
- Record major user actions such as uploads, updates, and restores  
- Display date and time of each action  

### 9. Mobile Support
- View projects on mobile devices  
- Upload files from mobile  
- Browse version history  

---

## Comparison with GitHub

GitHub is a professional development platform designed for software engineers and code collaboration. It focuses on technical workflows such as commits, branches, and pull requests, and requires knowledge of Git commands.

ProjectVault differs in both purpose and design. It is intended for students and academic users, supports all academic file types, does not require version control knowledge, and emphasizes visual history and easy recovery over developer-centric workflows.

In summary:
- GitHub is designed for building software  
- ProjectVault is designed for managing academic projects  

---

## System Design and Tech Stack

### Web Frontend
- React.js  
- Used for dashboards, project views, uploads, and version history visualization  

### Mobile Application
- React Native  
- Provides cross-platform mobile access  

### Backend
- Python (Flask / Django / FastAPI)  
- Handles authentication, project logic, versioning, comparison, and restore operations  

### Database
- MySQL / PostgreSQL / MongoDB  
- Stores user data, project metadata, version records, and activity logs  

### Authentication
- JWT (JSON Web Tokens)  

### File Storage
- Structured server-based storage  
- Each project version stored separately  

### API Layer
- REST APIs for communication between frontend, mobile app, and backend  

---

## Expected Outcome

The final system will allow students to manage academic projects safely, maintain structured version history, prevent data loss, and restore previous project states easily through a simple and intuitive web and mobile interface.

---

## Future Enhancements

- Team collaboration  
- Automatic scheduled backups  
- Cloud synchronization  
- Encryption for secure storage  
- Advanced version comparison tools  
- College-wide deployment  

python -m uvicorn app.main:app --reload --port 8000






