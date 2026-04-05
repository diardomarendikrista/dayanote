/**
 * @fileoverview Authentication controller handling user registration and login.
 * Uses bcrypt for password hashing and JWT for session tokens.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Registers a new user.
 * Hashes the password and generates a long-lived JWT (7 days).
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.email - User email.
 * @param {string} req.body.password - Plain text password.
 * @param {string} req.body.name - User full name.
 * @param {Object} res - Express response object.
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User created successfully', userId: user.id, token });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed: ' + error.message });
  }
};

/**
 * Logs in an existing user.
 * Validates credentials and handles special cases like admin-reset passwords.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.email - User email.
 * @param {string} req.body.password - Plain text password.
 * @param {Object} res - Express response object.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    /**
     * Special case: Admin-reset user (password is null or empty).
     * Returns a short-lived token (1 hour) and a `needsReset` flag.
     */
    if (!user.password || user.password === '') {
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Short-lived token for reset period
      );
      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
        needsReset: true
      });
    }

    /**
     * Standard password verification using bcrypt.
     */
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    /**
     * Generate standard session token (7 days).
     */
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: 'Login failed: ' + error.message });
  }
};
