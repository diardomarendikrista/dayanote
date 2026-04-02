# DayaNote: Collaborative Intelligence Memorandum System

DayaNote is a professional, high-performance collaborative note-taking application designed with an industrial "Daya Lima" aesthetic. It features real-time synchronization, granular permissions, and premium UX optimizations.

---

## Key Features

- **Real-time Collaboration**: Powered by **Yjs** and **Hocuspocus** for sub-millisecond sync.
- **Smart Navigation History**: Optimized browser history with `push`/`replace` logic and query-param note selection.
- **Progressive Web App (PWA)**: Full offline support and mobile-first experience with maskable icons and standalone mode.
- **Advanced Permissions**: Manage collaborators with SPECIFIC roles (**OWNER**, **EDITOR**, **VIEWER**).
- **Security Auth Guard**: Automated redirects and intelligent path protection for authenticated sessions.
- **Mobile UX Enhancements**: Dedicated "Recent Activity" section and unified navigation for mobile devices.
- **Premium Industrial Design**: Built with Tailwind CSS v4, 'Outfit' typography, and a refined dark aesthetic.

---

## Project Structure

```text
dayanote/
├── backend/            # Express Production Server
│   ├── config/         # Hocuspocus & Prisma Config
│   ├── controllers/    # Business Logic
│   ├── middlewares/    # Auth & Validation Middlewares
│   ├── prisma/         # Schema & Migrations
│   ├── routes/         # API & Socket endpoints
│   └── tests/          # Integration Tests
└── frontend/           # React + Vite + PWA
    ├── public/         # Static assets & Manifest
    └── src/
        ├── components/ # Reusable UI Components
        ├── pages/      # Dashboard (Modular), Auth, etc.
        ├── store/      # Zustand State
        └── utils/      # Tailwind cn() utilities
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
# Copy .env.example to .env and configure DATABASE_URL and JWT_SECRET
npx prisma db push
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Documentation

- [Full Changelog](CHANGELOG.md)
- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)

---

_DayaNote v1.3.0 | Premium Collaborative Intelligence_
