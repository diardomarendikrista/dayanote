/**
 * @fileoverview User controller handling user profile updates and password management.
 */

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Updates the user's profile information, including name and password.
 * Implements security checks when changing passwords.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user info.
 * @param {Object} req.body - Update fields (name, password, currentPassword).
 * @param {Object} res - Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, password, currentPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;

    /**
     * Handle password update logic.
     */
    if (password) {
      /**
       * If user ALREADY has a password set, they must provide the current one to change it.
       */
      if (user.password && user.password !== '') {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new one' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Incorrect current password' });
        }
      }
      
      /**
       * Hash the new password before storing it.
       */
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: 'Profile updated successfully',
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name }
    });
  } catch (error) {
    res.status(400).json({ error: 'Update failed: ' + error.message });
  }
};
