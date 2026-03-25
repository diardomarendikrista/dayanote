# DayaNote: Collaborative Note System

DayaNote is a professional, high-performance collaborative note-taking application designed with an industrial "Daya Lima" aesthetic. It features real-time synchronization, granular permissions, and premium typography.

## 🚀 Key Features

- **Real-time Collaboration**: Powered by Yjs and Hocuspocus for sub-millisecond sync.
- **Advanced Permissions**: Manage collaborators with SPECIFIC roles (OWNER, EDITOR, VIEWER).
- **Real-time Access Control**: Instant "kick" logic when privacy settings change or notes are deleted.
- **Improved Sidebar Sync**: Dynamic "Shared" status indicators and real-time title updates.
- **Premium Industrial Design**: Built with Tailwind CSS v4, 'Outfit' typography, and a refined dark aesthetic.
- **Clean Code Architecture**: Systematic use of `cn` utilities and atomic components.
- **Verified Stability**: Integrated Socket.io for consistent real-time events across the dashboard and public views.

## 🏗️ Project Structure

```text
dayanote/
├── backend/          # Node.js Express server
│   ├── config/       # Configuration modules (Hocuspocus/Prisma)
│   ├── controllers/  # Business logic (Socket.io integrated)
│   ├── routes/       # API endpoints
│   ├── prisma/       # Database schema & migrations
│   └── tests/        # Integration tests (Jest)
└── frontend/         # React + Vite application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Application views (Dashboard, NotePage)
    │   ├── utils/      # Tailwind utilities (cn.js)
    │   └── store/      # State management (Zustand)
```

## 🛠️ Quick Start

### Prerequisites

- Node.js (v20+)
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

_DayaNote v1.1.0-beta | Premium Collaborative Intelligence_
