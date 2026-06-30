# CivicLens AI

> AI-powered hyperlocal community issue reporting and resolution platform.

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://civiclens-ai.web.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5-purple)](https://ai.google.dev/)

## Overview

CivicLens AI enables citizens to report public infrastructure issues (potholes, water leaks, garbage, broken streetlights) while helping municipal authorities efficiently manage, prioritize, and resolve them using artificial intelligence.

**Key differentiators:**
- 🤖 AI-powered image categorization (Gemini 2.5 Flash)
- 🗣️ Voice-based issue reporting
- 📍 Smart location detection with Leaflet maps
- 🔄 Real-time notifications and status tracking
- 📊 Predictive analytics and AI decision intelligence
- 🎮 Gamification (badges, achievements, leaderboard)
- 🏛️ Full authority workflow (assign, track, resolve)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Google Gemini 2.5 Flash |
| Maps | Leaflet + OpenStreetMap + CARTO |
| Deployment | Firebase Hosting / Google Cloud |

## Quick Start

```bash
# Clone
git clone <repo-url>
cd "CivicLens AI"

# Frontend
cd client
cp .env.example .env  # Fill in your keys
npm install
npm run dev           # http://localhost:3000

# Backend (optional)
cd ../server
cp .env.example .env
npm install
npm run dev           # http://localhost:5000
```

## Environment Variables

See `.env.example` for required values:
- `VITE_FIREBASE_*` — Firebase project config
- `VITE_GEMINI_API_KEY` — Google AI Studio key

## User Roles

| Role | Capabilities |
|------|-------------|
| Citizen | Report issues, track status, verify, discuss, earn badges |
| Authority | Manage queue, assign, resolve, analytics, bulk actions |

## Architecture

```
client/src/
├── app/          # Router, providers
├── components/   # UI (design system), layout, shared
├── features/     # Feature modules (auth, dashboard, issues, etc.)
├── hooks/        # Custom React hooks
├── services/     # Business logic, Firestore, AI
├── types/        # TypeScript interfaces
├── utils/        # Pure utility functions
└── styles/       # Global CSS + Tailwind config
```

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Deployment](./DEPLOYMENT.md)
- [User Guide](./USER_GUIDE.md)
- [Security](./SECURITY.md)
- [Demo Script](./DEMO_SCRIPT.md)

## License

MIT
