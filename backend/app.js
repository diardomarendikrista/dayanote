/**
 * @fileoverview Express application configuration.
 * Sets up middleware, routes, and basic security configurations.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

/**
 * Configure Middleware
 * - CORS: Enable Cross-Origin Resource Sharing for all origins.
 * - express.json(): Parse incoming JSON payloads.
 */
app.use(cors());
app.use(express.json());

/**
 * Register API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

/**
 * Health check endpoint to verify server status.
 * @route GET /health
 */
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
