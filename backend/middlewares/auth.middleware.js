/**
 * @fileoverview Authentication middleware for protecting Express routes.
 * Handles JWT verification and user extraction from headers.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to enforce authentication.
 * If a valid token is provided, the decoded user info is attached to `req.user`.
 * Otherwise, returns a 401 Unauthorized or 400 Bad Request error.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware for optional authentication.
 * If a valid token is provided, the decoded user info is attached to `req.user`.
 * If no token is provided or the token is invalid, `req.user` is set to null and execution continues.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const optionalAuthMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    req.user = null;
    next();
  }
};

module.exports = { authMiddleware, optionalAuthMiddleware };
