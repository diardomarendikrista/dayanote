const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth.middleware');

// Note CRUD
router.get('/', authMiddleware, noteController.getNotes);
router.post('/', authMiddleware, noteController.createNote);
router.get('/:id', optionalAuthMiddleware, noteController.getNote);
router.put('/:id', authMiddleware, noteController.updateNote);
router.delete('/:id', authMiddleware, noteController.deleteNote);

// Permissions
router.post('/:id/permissions', authMiddleware, noteController.addPermission);
router.delete('/:id/permissions/:userId', authMiddleware, noteController.removePermission);

module.exports = router;
