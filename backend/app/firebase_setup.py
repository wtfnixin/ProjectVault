import os
import firebase_admin
from firebase_admin import credentials
from .config import settings

def init_firebase():
    if not firebase_admin._apps:
        try:
            # Fallback to direct path if .env wasn't fully reloaded by uvicorn
            path = settings.FIREBASE_CREDENTIALS_PATH or "./firebase-credentials.json"
            
            if os.path.exists(path):
                cred = credentials.Certificate(path)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized successfully.")
            else:
                print(f"Warning: Firebase credentials file not found at {path}. Google Auth won't work.")
        except Exception as e:
            print(f"Error initializing Firebase Admin: {e}")
