# DayaNote Frontend 1.3.0

The frontend of DayaNote is built for speed, responsiveness, and best user experience. Leverages modern web technologies to provide a native-app feel.

---

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Industrial Theme)
- **State Management**: Zustand
- **Real-time Synchronization**: Yjs + Hocuspocus + Socket.io
- **PWA Capabilities**: Service Workers (`vite-plugin-pwa`)
- **Persistence**: IndexedDB via `y-indexeddb`
- **Routing**: React Router 7 + useSearchParams for note selection

---

## Highlights

- **Navigation History**: Optimized browser history and deep linking via query parameters (`?note=ID`).
- **Progressive Web App (PWA)**: Full offline-first capabilities and mobile standalone mode support.
- **Mobile "Recent Activity"**: Enhanced dashboard with quick access to recent notes for mobile users.
- **Glow Industrial Aesthetic**: Optimized dark mode with custom pendar (glow) effects on the editor.

---

## Setup

1. Install dependencies: `npm install`
2. Configure `.env`:
   - `VITE_API_URL`: Your backend API URL.
   - `VITE_WS_URL`: Your Hocuspocus WebSocket URL.
3. Start development: `npm run dev`
