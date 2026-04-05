/**
 * @fileoverview Note routes.
 * Defines endpoints for note CRUD operations and permission management.
 */

const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * Note CRUD Endpoints
 */

/**
 * Get all notes for the authenticated user.
 * @route GET /api/notes
 */
router.get('/', authMiddleware, noteController.getNotes);

/**
 * Create a new note.
 * @route POST /api/notes
 */
router.post('/', authMiddleware, noteController.createNote);

/**
 * Get a specific note by ID. 
 * uses optionalAuthMiddleware to allow public note access.
 * @route GET /api/notes/:id
 */
router.get('/:id', optionalAuthMiddleware, noteController.getNote);

/**
 * Update an existing note.
 * @route PUT /api/notes/:id
 */
router.put('/:id', authMiddleware, noteController.updateNote);

/**
 * Delete a note.
 * @route DELETE /api/notes/:id
 */
router.delete('/:id', authMiddleware, noteController.deleteNote);

/**
 * Permission Management Endpoints
 */

/**
 * Add or update permissions for a user on a specific note.
 * @route POST /api/notes/:id/permissions
 */
router.post('/:id/permissions', authMiddleware, noteController.addPermission);

/**
 * Remove a user's permissions from a specific note.
 * @route DELETE /api/notes/:id/permissions/:userId
 */
router.delete('/:id/permissions/:userId', authMiddleware, noteController.removePermission);

module.exports = router;
