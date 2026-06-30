# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React + Vite)                  │
├─────────────────────────────────────────────────────────┤
│  Features    │  Components  │  Hooks   │  Services       │
│  ─────────   │  ──────────  │  ──────  │  ────────       │
│  auth/       │  ui/         │  useAuth │  firebase       │
│  dashboard/  │  layout/     │  useAI   │  aiService      │
│  issues/     │  shared/     │  useMap  │  issueService   │
│  community/  │  location/   │  useWF   │  ruleEngine     │
│  authority/  │              │          │  notificationSvc│
│  analytics/  │              │          │  realtimeService│
│  profile/    │              │          │                 │
│  landing/    │              │          │                 │
└──────────────┴──────────────┴──────────┴─────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│                    Firebase (BaaS)                        │
├─────────────────────────────────────────────────────────┤
│  Auth        │  Firestore     │  Storage (future)        │
│  ─────       │  ──────────    │  ───────────────         │
│  Email/Pass  │  issues/       │  issue-images/           │
│  Google SSO  │  users/        │                          │
│              │  notifications/│                          │
└──────────────┴────────────────┴──────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Layer                               │
├─────────────────────────────────────────────────────────┤
│  Gemini 2.5 Flash                                        │
│  ─────────────────                                       │
│  • Image categorization (municipalPrompt.ts)             │
│  • Voice transcript processing (voiceAIService.ts)       │
│  • Chat assistant (geminiAssistantService.ts)            │
│  • Duplicate detection (duplicateDetectionService.ts)    │
│  • Rule engine (ruleEngine.ts) — Gemini-ready            │
└─────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Business logic outside components** — all services are pure functions/async
2. **Hooks as bridges** — connect services to React lifecycle
3. **Feature-based folders** — each feature is self-contained
4. **Reusable design system** — 20+ shared UI components
5. **CSS variables for theming** — dark mode via class toggle
6. **TypeScript throughout** — strict mode, no `any` (except voice API)

## Firestore Schema

```
issues/{id}
  ├── trackingId, title, description, category, severity
  ├── status, department, imageDataURL
  ├── location { latitude, longitude, address, source }
  ├── aiMetadata { confidence, wasEdited, model, analyzedAt }
  ├── reporter { uid, name, email }
  ├── timeline [] { action, by, at, note }
  ├── verifications [] { userId, userName, verifiedAt }
  ├── followers [] (user IDs)
  ├── validations (count), commentCount
  ├── resolution { summary, completedAt }
  ├── assignedOfficer, assignedAt, inProgressAt, resolvedAt
  └── createdAt, updatedAt

users/{uid}
  ├── uid, name, email, role, profileCompleted
  ├── phone, city, state, department, organization
  └── createdAt, updatedAt

notifications/{id}
  ├── userId, type, title, message, issueId
  ├── read
  └── createdAt

issues/{id}/comments/{commentId}
  ├── authorId, authorName, authorRole
  ├── content, parentId, helpful
  └── createdAt, updatedAt
```
