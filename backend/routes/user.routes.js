/**
 * @fileoverview User routes.
 * Defines endpoints for user profile management.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

/**
 * Route to update the authenticated user's profile.
 * @route PUT /api/users/profile
 */
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
