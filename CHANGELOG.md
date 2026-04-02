# Changelog

All notable changes to this project will be documented in this file. Versioning follows a conservative Beta (0.x.x) scheme.

---

## [0.2.4] - 2026-04-02
### Added
- **Real-time Note Ordering**: Notes now automatically re-sort to the top as soon as content is edited or saved without needing a refresh.
- **Enhanced Sync Hooks**: Backend now broadcasts full metadata updates for instant client-side synchronization.

## [0.2.3] - 2026-04-02
### Fixed
- **Permission Elevation**: Resolved 403 Forbidden errors for collaborators with the `EDITOR` role when updating note titles.
- **Privacy Controls**: Restricted sharing configuration access exclusively to the Note Owner.

## [0.2.2] - 2026-04-02
### Added
- **Mobile UI Refactor**: Integrated directory search and a native-style header action for creating new notes on mobile devices.
- **Clean Dashboard**: Replaced the placeholder empty state with a functional notes directory on mobile.

## [0.2.1] - 2026-04-02
### Fixed
- **Deep Link Stability**: Fixed a fatal crash when rendering shared notes due to missing collaborator metadata.

## [0.2.0] - 2026-04-02
### Added
- **Platform Intelligence**: Integrated scheduled Google Drive backups and PWA capability for offline-ready fonts and assets.
- **Smart Core**: Implemented logical navigation history (`push`/`replace`) and URL-driven state management.
- **Architecture**: Unified project execution via root `package.json` and centralized version control.

## [0.1.1] - 2026-03-31
### Changed
- **Performance**: Optimized editor and search instances for smooth interaction on large documents.
- **Stability**: Hardened WebSocket reconnection logic for better survival on spotty connections.

## [0.1.0] - 2026-03-25
### Added
- **Initial Release (MVP)**: Core architecture using Express, Prisma, React, and Tailwind CSS.
- **Collaboration Suite**: Built-in Yjs and Tiptap integration for real-time multiplayer editing and permission-based sharing.

[0.2.4]: https://github.com/diardomarendikrista/dayanote/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/diardomarendikrista/dayanote/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/diardomarendikrista/dayanote/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/diardomarendikrista/dayanote/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/diardomarendikrista/dayanote/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/diardomarendikrista/dayanote/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/diardomarendikrista/dayanote/releases/tag/v0.1.0
