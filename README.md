# DayaNote: Collaborative Memorandum System

DayaNote is a professional, high-performance collaborative note-taking application designed with an industrial "Daya Lima" aesthetic. It features real-time synchronization, granular permissions, and offline-first capabilities.

## 🚀 Key Features

- **Real-time Collaboration**: Powered by Yjs and Hocuspocus for sub-millisecond sync.
- **Advanced Permissions**: Manage collaborators with SPECIFIC roles (OWNER, EDITOR, VIEWER).
- **Public & Private Notes**: Toggle visibility and set public access levels (Read-Only or Edit).
- **Industrial Design**: Premium UI built with Tailwind CSS v4 and custom design tokens.
- **Offline First**: PWA support with IndexedDB persistence for seamless work without internet.
- **Verified Stability**: 100% backend test coverage for core logic.

## 🏗️ Project Structure

```text
dayanote/
├── backend/          # Node.js Express server
│   ├── config/       # Configuration modules (Hocuspocus)
│   ├── controllers/  # Business logic
│   ├── routes/       # API endpoints
│   ├── prisma/       # Database schema & migrations
│   └── tests/        # Integration tests (Jest)
└── frontend/         # React + Vite application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Application views
    │   └── store/      # State management (Zustand)
```

## 🛠️ Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### 1. Backend Setup

```bash
cd backend
npm install
# Configure .env with your DATABASE_URL and JWT_SECRET
npx prisma db push
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📜 Documentation

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)

---

_DayaNote v1.0.0-beta | Industrial Strength Collaboration_
