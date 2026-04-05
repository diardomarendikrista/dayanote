/**
 * @fileoverview Authentication routes.
 * Maps authentication-related endpoints to the auth controller.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * Route for user registration.
 * @route POST /api/auth/register
 */
router.post('/register', authController.register);

/**
 * Route for user login.
 * @route POST /api/auth/login
 */
router.post('/login', authController.login);

module.exports = router;
