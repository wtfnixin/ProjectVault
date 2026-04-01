# Firebase Google Authentication Setup Guide

This guide explains how to properly configure Firebase for the Google Sign-In integration in ProjectVault.

## 1. Firebase Console Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, enter a name (e.g., "ProjectVault"), and click Continue. 
3. (Optional) Disable Google Analytics for this project, then click **Create Project**.
4. Once created, click on the **Web** icon `</>` to register a new web app.
5. Register the app with a nickname (e.g., "ProjectVault Frontend"). You don't need to set up Firebase Hosting.
6. Copy the `firebaseConfig` object (apiKey, authDomain, etc.) shown on the screen.

## 2. Enable Google Authentication

1. In the Firebase Console, go to **Build > Authentication** from the left sidebar.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Click **Add new provider** and select **Google**.
5. Enable it, provide a Project support email, and click **Save**.

## 3. Frontend Configuration

In your `frontend/` directory, create a `.env` file (or update your existing one) with the credentials you got from step 1.5:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 4. Backend Configuration (Admin SDK)

The backend requires the Firebase Admin SDK to securely verify the tokens sent by the frontend.

1. Go to **Project Settings** (click the gear icon next to "Project Overview").
2. Navigate to the **Service accounts** tab.
3. Make sure **Node.js** or **Python** is selected, and click **Generate new private key**.
4. Download the JSON file containing the service account credentials. Keep this file **secure** and **do not commit it to version control**.
5. Place the JSON file somewhere accessible to your backend (for example, in the root of your `backend/` directory, named `firebase-credentials.json`).
6. Update the backend `.env` file to point to this file:

```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

Once both `.env` files are set up, restart your backend and frontend servers, and Google Sign-In will be fully functional.
