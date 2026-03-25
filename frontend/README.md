# DayaNote Frontend

The frontend of DayaNote is built for speed, responsiveness, and a premium user experience. It leverages modern web technologies to provide a native-app feel.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Industrial Theme)
- **State Management**: Zustand
- **Real-time Events**: Socket.io Client
- **Utilities**: `tailwind-merge` & `clsx` (via `cn.js`)
- **Editor**: TipTap (ProseMirror) with Yjs integration
- **Synchronization**: Hocuspocus Provider
- **Icons**: Lucide React
- **Typography**: 'Outfit' (Headings) & 'Inter' (Body)

## ✨ Highlights

- **Real-time Security Sync**: Instant "kick" or interface lock when permissions change or notes are deleted.
- **Improved Shared Status**: Dynamic sidebar indicators showing `Shared`, `Public`, or `Private`.
- **Premium Glow Aesthetic**: Industrial dark mode with custom pendar (glow) effects on the editor.
- **Responsive Design**: Optimized for both desktop workspaces and mobile viewing.
- **Optimized Persistence**: Local changes are stored in IndexedDB before syncing.

## 🛠️ Setup

1. Install dependencies: `npm install`
2. Configure `.env`:
   - `VITE_API_URL`: Your backend API URL.
   - `VITE_WS_URL`: Your Hocuspocus WebSocket URL (ws://...).
3. Start development: `npm run dev`

## 📁 Source Overview

- `/src/utils/cn.js`: Utility for safe Tailwind class merging.
- `/src/components/CollaborativeEditor.jsx`: The heart of the app, managing TipTap and WebSocket sync.
- `/src/components/NoteSettingsModal.jsx`: Access control UI for managing permissions.
- `/src/pages/NotePage.jsx`: The public/shared view with real-time security listeners.
