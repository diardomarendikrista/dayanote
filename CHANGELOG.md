# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-04-02

### Added

- **Reusable Modal System**: Implemented a core base Modal component with premium blur effects and consistent layout.
- **PWA Integration**: Full Progressive Web App support with specialized caching for fonts (`woff2`) and mobile-optimized manifest.
- **Mobile Optimizations**: Added `apple-mobile-web-app-capable` meta tags and `user-scalable=no` for a native app feel on iOS/Android.
- **Version Indicator**: Added a subtle version badge in the Sidebar for better environment tracking.
- **English Localization**: Standardized all UI labels and system confirmations to English.

### Changed

- **Modular Dashboard**: Refactored the monolithic `Dashboard.jsx` into a modular directory structure (`Header`, `Sidebar`, `NoteItem`, etc.).
- **Enhanced Toasts**: Improved Toast notification contrast and typography for better legibility in Light Theme.
- **Note Navigation**: Optimized padding and layout responsiveness in `NotePage.jsx`.

### Fixed

- Resolved duplicate default export issues in Dashboard and NoteSettingsModal.
- Fixed overlapping navbar issues on mobile view.

---

## [1.2.0] - 2026-03-31

### Added

- Real-time synchronization enhancements for collaborative editing.
- Automatic reconnection logic for WebSocket instances.

### Changed

- Performance profiling and optimization for the Tiptap editor instance.
- Enhanced sidebar search functionality.

---

## [1.1.0-beta] - 2026-03-27

### Added

- **Permission System**: Implemented advanced note permissions (Viewer/Editor) and multi-user collaboration.
- **Public Sharing**: Added capability to generate secure public links for note viewing.
- **Deployment Workflows**: Separated Backend and Frontend CI/CD pipelines for more efficient delivery.

---

## [1.0.0] - 2026-03-25

### Added

- **Initial Release**: DayaNote MVP with basic folder structure and Git configuration.
- **Core Editor**: Integration with Yjs and Tiptap for collaborative intelligence.
- **Base Architecture**: Express backend with Prisma and React frontend with Tailwind CSS.

[1.3.0]: https://github.com/diardomarendikrista/dayanote/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/diardomarendikrista/dayanote/compare/v1.1.0-beta...v1.2.0
[1.1.0-beta]: https://github.com/diardomarendikrista/dayanote/compare/v1.0.0...v1.1.0-beta
[1.0.0]: https://github.com/diardomarendikrista/dayanote/releases/tag/v1.0.0
