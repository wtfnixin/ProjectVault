# ProjectVault

ProjectVault is an academic project backup and versioning system. This repository contains both the frontend (React + Vite) and backend (FastAPI + SQLite) code.

## Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

## Installation Guide

### 1. Backend Setup

The backend is built with FastAPI and uses SQLite for the database.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    # Windows
    python -m venv venv

    # macOS/Linux
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    ```bash
    # Windows
    .\venv\Scripts\activate

    # macOS/Linux
    source venv/bin/activate
    ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the backend server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The server will start at `http://localhost:8000`. API docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup

The frontend is a React application powered by Vite.

1.  **Navigate to the frontend directory:**
    Open a new terminal window (keep the backend running) and go to the frontend folder:
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will typically start at `http://localhost:5173`.

### 3. Usage

1.  Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2.  Register a new account (local database).
3.  Start creating projects and uploading files!

## Configuration (Optional)

### Backend
You can create a `.env` file in the `backend` directory to override defaults:
```env
DATABASE_URL=sqlite:///./projectvault.db
SECRET_KEY=your-secret-key
```

### Frontend
You can create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api
```
