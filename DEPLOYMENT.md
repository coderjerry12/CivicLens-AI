# Deployment Guide

## Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Auth + Firestore enabled
- Gemini API key from https://aistudio.google.com/apikey

## Firebase Hosting Deployment

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase (first time only)

```bash
firebase init
# Select: Hosting
# Public directory: client/dist
# Single-page app: Yes
# Overwrite index.html: No
```

### 3. Build

```bash
cd client
npm run build
```

### 4. Deploy

```bash
firebase deploy --only hosting
```

### 5. Firestore Security Rules

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Environment Variables

### Client (.env)

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000
VITE_FIREBASE_APP_ID=1:000:web:000
VITE_GEMINI_API_KEY=your_gemini_key
```

### Server (.env)

```
PORT=5000
NODE_ENV=production
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="<your-firebase-private-key>"
GEMINI_API_KEY=your_key
CORS_ORIGIN=https://your-domain.web.app
```

## Google Cloud Deployment Checklist

- [ ] Firebase project on Spark plan (free) or Blaze (pay-as-you-go)
- [ ] Firestore in test mode or with security rules deployed
- [ ] Authentication providers enabled (Email/Password + Google)
- [ ] Gemini API enabled on Google Cloud Console
- [ ] Environment variables set in production
- [ ] Build passes with zero errors
- [ ] Lighthouse scores meet targets (>90)
