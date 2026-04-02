# Changelog

All notable changes to this project will be documented in this file.

---

## [1.4.4] - 2026-04-02
### Added
- **Real-time Note Ordering**: Notes in the sidebar and dashboard directory now automatically re-sort to the top as soon as they are edited or saved.
- **Improved Sync**: Enhanced Hocuspocus backend to broadcast full note metadata updates (including `updatedAt`), ensuring all collaborators see the correct sort order instantly.

## [1.4.3] - 2026-04-02
### Fixed
- **Permission Elevation**: Resolved an issue where collaborators with the `EDITOR` role were incorrectly restricted from updating note titles (403 Forbidden). Editors now have full title/content editing rights.
- **Security**: Added strict server-side checks to ensure only the `OWNER` can modify sensitive note settings like `isPublic` and `publicRole`.

## [1.4.2] - 2026-04-02
### Added
- **Mobile Dashboard Refactor**: Integrated a full notes directory directly into the Dashboard welcome screen for mobile users.
- **Persistent Search**: Added a real-time search bar to the mobile dashboard for faster note filtering.
- **Native Header Actions**: Moved the "Create New Note" button to the mobile navbar for immediate accessibility.
- **Root Management**: Created a root `package.json` to manage Backend and Frontend with unified scripts (`npm run dev`).

### Changed
- **Editor UX**: Tightened `line-height` and paragraph margins in the editor for a more compact and mobile-friendly writing experience.
- **Architecture**: Centralized versioning in the root `package.json` to prevent redundant builds of the backend/frontend sub-modules.

## [1.4.1] - 2026-04-02
### Fixed
- Fixed "Cannot read properties of undefined (reading 'name')" error when opening shared notes via deep link.
- Added protective optional chaining to `NoteSettingsModal` to handle incomplete data during initial render.

## [1.4.0] - 2026-04-02
### Added
- **Database Auto-Backup**: Integrated Google Drive API for scheduled database backups (every 12 hours).
- **Automated Retention**: Backups on Google Drive are automatically cleaned up after 14 days.
- **Manual Backup Trigger**: Added ability to trigger backups manually via internal services for testing or management.

### Fixed
- **Account Deletion (Cascade)**: Fixed an issue where users couldn't be deleted via SQL due to missing `ON DELETE CASCADE` constraints on Notes and Permissions.

### Changed
- **Version Synchronization**: Synced Backend and Frontend versions to v1.4.0.

---

## [1.3.0] - 2026-04-02
### Added
- **Smart Navigation History**: Implemented logical `push`/`replace` behavior. Switching between notes now replaces history, while the first note selection pushes it. Clicking "Back" returns you directly to the Home dashboard.
- **Deep Linking**: Note selection is now URL-driven via `?note=ID` query parameters, allowing site refreshes and link sharing to keep the active note.
- **Auth Guard Redirection**: Automated redirects from `/login` and `/register` if a valid session token is detected.
- **PWA Integration**: Full Progressive Web App support with specialized caching for fonts (`woff2`) and mobile-optimized manifest.
- **Mobile "Recent Activity"**: Added a dynamic section to the Empty State on mobile for quick access to the 3 most recently updated notes.
- **Unified Logo Navigation**: Made all "DayaNote" logos (Sidebar, Header, MobileHeader) clickable to return to the Dashboard Home.
- **Version Indicator**: Added a subtle version badge (`v1.3.0`) in the Sidebar.

### Changed
- **Modular Dashboard Architecture**: Refactored the monolithic `Dashboard.jsx` into a modular directory structure (`Header`, `Sidebar`, `EmptyState`, etc.) for better maintainability.
- **Enhanced Modal System**: Implemented a central reusable `Modal.jsx` component with premium backdrop blur and consistent animations.
- **UI/UX Polishing**: Improved Toast notification contrast for Light Theme and adjusted padding for mobile responsiveness.
- **Localization**: Standardized all UI labels and system confirmations to **English**.

### Fixed
- Resolved Dashboard crash regressions caused by missing prop definitions in sub-components.
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

[1.4.0]: https://github.com/diardomarendikrista/dayanote/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/diardomarendikrista/dayanote/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/diardomarendikrista/dayanote/compare/v1.1.0-beta...v1.2.0
[1.1.0-beta]: https://github.com/diardomarendikrista/dayanote/compare/v1.0.0...v1.1.0-beta
[1.0.0]: https://github.com/diardomarendikrista/dayanote/releases/tag/v1.0.0
