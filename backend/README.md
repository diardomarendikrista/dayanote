# DayaNote Backend

A modular Node.js API and WebSocket server for real-time collaboration.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Sync Server**: Hocuspocus (by Tiptap)
- **Real-time Events**: Socket.io
- **Auth**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest

---

---

## API Documentation

### Authentication

#### `POST /api/auth/register`

Creates a new account and returns a token.

- **Request**: `{ email, password, name }`
- **Response**: `{ userId, token, message }`

#### `POST /api/auth/login`

Authenticates a user.

- **Request**: `{ email, password }`
- **Response**: `{ user: { id, email, name }, token }`

#### `GET /api/notes`

Returns all notes owned by or shared with the user.

- **Auth**: Required
- **Response**: `Array<{ id, title, isPublic, publicRole, role, _count: { permissions }, ... }>`

#### `POST /api/notes`

Creates a new note.

- **Auth**: Required
- **Request**: `{ title }`
- **Response**: `{ id, title, role: 'OWNER', ... }`

#### `GET /api/notes/:id`

Fetch a specific note. Accessible if owner, collaborator, or if the note is public.

- **Auth**: Optional
- **Response**: `{ id, title, content, isPublic, publicRole, role, owner, permissions, _count: { permissions } }`

#### `PUT /api/notes/:id`

Update note title, content, or privacy.

- **Auth**: Required (Owner Only)
- **Request**: `{ title, content, isPublic, publicRole }`

#### `DELETE /api/notes/:id`

Permanently delete a note.

- **Auth**: Required (Owner Only)

### Permissions

#### `POST /api/notes/:id/permissions`

Share a note with another user.

- **Request**: `{ email, role: 'VIEWER' | 'EDITOR' }`

#### `DELETE /api/notes/:id/permissions/:userId`

Remove a collaborator's access.

---

## Real-time (WebSocket)

- **Hocuspocus**: Connect to `ws://localhost:4015` with `token` and `documentName`. Handles Yjs document synchronization and authorization.
- **Socket.io**: Used for real-time UI events (e.g., `check_access`, `note_deleted`, `title_updated`). Uses room-based broadcast (`note_{id}` and `user_{id}`).

---

## Testing

Run the integration test suite:

```bash
npm test
```

The suite covers Authentication and Note CRUD with 100% pass rate.

---

## Architecture

- `index.js`: Server entry, WebSocket, and Socket.io setup.
- `app.js`: Express application and middleware.
- `routes/`: Endpoint definitions.
- `controllers/`: Business logic implementations.
- `config/hocuspocus.js`: Hocuspocus hook logic (OnAuthenticate, OnConnect).
