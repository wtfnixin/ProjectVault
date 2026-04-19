# 📦 ProjectVault

## Live Demo: https://project-vault-tau.vercel.app/

> A developer-grade version control and asset management platform built for creatives, researchers, and non-developers.

ProjectVault modernizes how professionals handle large, binary project files. Instead of trusting consumer cloud storage to auto-sync mistakes or relying on confusing developer tools like Git, ProjectVault provides an intuitive, explicitly milestone-driven snapshot workflow to ensure your project's history is perfectly preserved.

---

## 🎯 The Problem
Modern digital workflows in design, architecture, video, and academia rely on large, monolithic files. 
- Traditional cloud storage (like Google Drive or Dropbox) is designed for real-time automated synchronization. If you delete content and the sync occurs, the original work is lost or hidden behind clunky "version history" menus.
- Developer version control (like Git) is designed for line-by-line text tracking, failing miserably with large binary media files and presenting an enormous learning curve.

**ProjectVault is the bridge:** The immutability and absolute certainty of developer-grade snapshotting, packaged in a beautifully simple, non-technical interface.

---

## ✨ Key Features
- **Immutable Versioning:** Upload your project folder as discrete "Versions". If a client rejects the latest draft, download exactly what existed at "Draft 1" with a single click.
- **Embedded Project Documentation:** A dedicated documentation tab equipped with a robust WYSIWYG Markdown editor. Features dual-pane split-screen editing, flawless dark mode synchronization, and allows both technical and non-technical users to manage rich README files persistently stored in the database.
- **Binary-Optimized Architecture:** Separate metadata DB and direct disk I/O ensures flawless handling of massive PSDs, video files, and 3D models.
- **Activity Auditing:** Complete, transparent activity heatmap logging who updated the project, when files were deleted, and which versions were published.
- **Enterprise-Grade Security:**
  - Stateless JSON Web Token (JWT) authentication.
  - Strict Rate Limiting to prevent brute-force and credential stuffing.
  - OS-Level Path Traversal mitigation preventing "Zip-Slip" filesystem hacks.

---

## 🛠 Tech Stack

**Frontend**
- **Framework:** React.js
- **Build Tool:** Vite (for rapid HMR and optimized static bundling)
- **Styling:** CSS Modules / Vanilla CSS

**Backend**
- **Framework:** FastAPI (Python) - Chosen for native async/await support, critical for heavy concurrent file I/O processing.
- **ORM:** SQLAlchemy
- **Database:** SQLite (local dev) / PostgreSQL (production)
- **Server:** Uvicorn (ASGI)
- **Security:** SlowAPI (Rate Limiting), BCrypt (Password Hashing), python-jose (JWT manipulation)

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/wtfnixin/ProjectVault.git
cd ProjectVault
```

### 2. Backend Setup
Navigate into the backend directory and activate your virtual environment:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

Install the dependencies and create the `.env` file:
```bash
pip install -r requirements.txt

# Ensure you have your environment variables set properly:
# SECRET_KEY=your_super_secret_key
# ALGORITHM=HS256
```

Start the FastAPI server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```
*The backend API will be running at `http://localhost:8000` and automatic Swagger docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install the required NPM packages.

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The React application will be accessible at `http://localhost:5173`.*

---

## 🏗 System Architecture 

```
ProjectVault/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── routes/           # Auth, Project, and File Controllers
│   │   ├── models.py         # SQLAlchemy Database Schemas
│   │   ├── schemas.py        # Pydantic Request/Response validation
│   │   ├── auth.py           # JWT and BCrypt security logic
│   │   ├── limiter.py        # Request throttling
│   │   └── main.py           # Main ASGI execution entrypoint
│   └── requirements.txt
└── frontend/                 # React UI Application
    ├── src/
    │   ├── components/       # Reusable UI components (Heatmap, Dashboards)
    │   ├── pages/            # View components (Auth, ResetPassword, etc.)
    │   └── App.jsx           # Main routing entrypoint
    └── package.json
```

---

## 🛡 Security Notes
ProjectVault does not utilize a live SMTP server natively. During development, Magic Links, "Forgot Password" tokens, and activity alerts are printed directly to the backend terminal to prevent API token leakage and ensure testing environments remain contained.

---

## 📄 License
This project is for educational and proprietary pitching purposes.
