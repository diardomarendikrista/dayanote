# DayaNote Frontend

The frontend of DayaNote is built for speed, responsiveness, and a premium user experience. It leverages modern web technologies to provide a native-app feel.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Industrial Theme)
- **State Management**: Zustand
- **Editor**: TipTap (ProseMirror) with Yjs integration
- **Synchronization**: Hocuspocus Provider
- **Icons**: Lucide React
- **Notifications**: Custom Industrial Toast System

## ✨ Highlights

- **PWA Ready**: Installable on desktop and mobile with offline support.
- **Collaborative Cursor**: (Alpha) Real-time presence indicators.
- **Responsive Design**: Optimized for both desktop workspaces and mobile viewing.
- **Optimized Persistence**: Local changes are stored in IndexedDB before syncing.

## 🛠️ Setup

1. Install dependencies: `npm install`
2. Configure `.env`:
   - `VITE_API_URL`: Your backend API URL.
   - `VITE_WS_URL`: Your Hocuspocus WebSocket URL.
3. Start development: `npm run dev`

## 📁 Source Overview

- `/src/components/CollaborativeEditor.jsx`: The heart of the app, managing TipTap and WebSocket sync.
- `/src/components/NoteSettingsModal.jsx`: Access control UI for managing permissions.
- `/src/pages/NotePage.jsx`: The public/shared view with specific guest logic.
