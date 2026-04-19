import os
import json
import firebase_admin
from firebase_admin import credentials
from .config import settings

def init_firebase():
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_CREDENTIALS_JSON:
                import base64
                try:
                    # try base64 parsing first
                    decoded_creds = base64.b64decode(settings.FIREBASE_CREDENTIALS_JSON).decode('utf-8')
                    cred_dict = json.loads(decoded_creds)
                except Exception:
                    # fallback to direct json
                    cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized successfully from env JSON.")
            else:
                # Fallback to direct path if .env wasn't fully reloaded by uvicorn
                path = settings.FIREBASE_CREDENTIALS_PATH or "./firebase-credentials.json"
                
                if os.path.exists(path):
                    cred = credentials.Certificate(path)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin initialized successfully from file.")
                else:
                    print(f"Warning: Firebase credentials file not found at {path}. Google Auth won't work.")
        except Exception as e:
            print(f"Error initializing Firebase Admin: {e}")
