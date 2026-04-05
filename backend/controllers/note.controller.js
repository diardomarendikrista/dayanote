/**
 * @fileoverview Note controller handling CRUD operations and permissions for notes.
 * Integrates with Prisma for database access and Socket.io for real-time updates.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Helper function to retrieve the Socket.io instance from the Express app.
 * @param {Object} req - Express request object.
 * @returns {Object|null} Socket.io instance or null if not found.
 */
const getIO = (req) => req.app.get('io');

/**
 * Fetches all notes owned by or shared with the authenticated user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user info.
 * @param {Object} res - Express response object.
 */
exports.getNotes = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { permissions: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        permissions: { where: { userId: req.user.id } },
        _count: { select: { permissions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    /**
     * Map notes to include the specific role of the requesting user.
     */
    const notesWithRole = notes.map(note => {
      let role = 'VIEWER';
      if (note.ownerId === req.user.id) role = 'OWNER';
      else if (note.permissions.length > 0) role = note.permissions[0].role;
      return { ...note, role };
    });

    res.json(notesWithRole);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notes: ' + error.message });
  }
};

/**
 * Creates a new note for the authenticated user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} [req.body.title] - Optional title for the note.
 * @param {Object} res - Express response object.
 */
exports.createNote = async (req, res) => {
  try {
    const { title } = req.body;
    const note = await prisma.note.create({
      data: {
        title: title || 'Untitled Note',
        ownerId: req.user.id,
      },
    });
    res.status(201).json({ ...note, role: 'OWNER' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note: ' + error.message });
  }
};

/**
 * Fetches a single note by ID, verifying access permissions.
 * 
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - Note ID.
 * @param {Object} res - Express response object.
 */
exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        permissions: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { permissions: true } },
      },
    });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    /**
     * Access check: Owner OR Public OR has explicit Permission.
     */
    const isOwner = req.user && note.ownerId === req.user.id;
    const hasPermission = req.user && note.permissions.some(p => p.userId === req.user.id);

    if (!isOwner && !note.isPublic && !hasPermission) {
      return res.status(403).json({ error: 'Access restricted' });
    }

    /**
     * Determine user role for the response.
     */
    let role = 'VIEWER';
    if (isOwner) role = 'OWNER';
    else if (hasPermission) role = note.permissions.find(p => p.userId === req.user.id).role;
    else if (note.isPublic) role = note.publicRole;

    res.json({ ...note, role });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch note: ' + error.message });
  }
};

/**
 * Grants permission (EDITOR/VIEWER) to another user for a specific note.
 * Only owners can perform this action.
 * 
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - Note ID.
 * @param {Object} req.body - Request body (email, role).
 * @param {Object} res - Express response object.
 */
exports.addPermission = async (req, res) => {
  try {
    const { id } = req.params; // note id
    const { email, role } = req.body;

    const note = await prisma.note.findUnique({ where: { id } });
    if (note.ownerId !== req.user.id) return res.status(403).json({ error: 'Only owners can share' });

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.id === req.user.id) return res.status(400).json({ error: 'You are already the owner of this note' });

    const permission = await prisma.permission.upsert({
      where: { userId_noteId: { userId: targetUser.id, noteId: id } },
      update: { role },
      create: { userId: targetUser.id, noteId: id, role },
    });

    /**
     * Notify the target user of their updated access level via Socket.io.
     */
    const io = getIO(req);
    if (io) {
      io.to(`user_${targetUser.id}`).emit('access_changed', { noteId: id, role });
    }

    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: 'Failed to share: ' + error.message });
  }
};

/**
 * Removes access for a user from a specific note.
 * Only owners can perform this action.
 * 
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - Note ID.
 * @param {string} req.params.userId - ID of the user to remove access for.
 * @param {Object} res - Express response object.
 */
exports.removePermission = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const note = await prisma.note.findUnique({ where: { id } });
    if (note.ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.permission.delete({
      where: { userId_noteId: { userId, noteId: id } },
    });

    /**
     * Notify the target user that their access has been revoked.
     */
    const io = getIO(req);
    if (io) {
      io.to(`user_${userId}`).emit('access_revoked', { noteId: id });
    }

    res.json({ message: 'Permission removed' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to remove permission' });
  }
};

/**
 * Updates a note's title, content, or sharing settings.
 * Validates edit permissions (OWNER, EDITOR).
 * 
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - Note ID.
 * @param {Object} req.body - Update fields (title, content, isPublic, publicRole).
 * @param {Object} res - Express response object.
 */
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPublic, publicRole } = req.body;
    
    const note = await prisma.note.findUnique({
      where: { id },
      include: { permissions: { where: { userId: req.user.id } } },
    });

    if (!note) return res.status(404).json({ error: "Note not found" });

    /**
     * Access determination: Determine if the user has EDIT rights.
     */
    const isOwner = note.ownerId === req.user.id;
    const userPermission = note.permissions[0];
    const isExplicitEditor = userPermission && userPermission.role === "EDITOR";
    const isPublicEditor = note.isPublic && note.publicRole === "EDITOR";
    
    const canEdit = isOwner || isExplicitEditor || isPublicEditor;

    if (!canEdit) {
      console.warn(`[Auth] User ${req.user.id} denied EDIT access to note ${id}. Role: ${userPermission?.role || 'NONE'}, PublicRole: ${note.publicRole}`);
      return res.status(403).json({ error: "You do not have permission to edit this note" });
    }

    /**
     * Prepare update data carefully.
     */
    const updateData = {};
    if (typeof title !== "undefined") updateData.title = title;
    if (typeof content !== "undefined") updateData.content = content;

    /**
     * Only the OWNER can modify core sharing settings (isPublic, publicRole).
     */
    if (isOwner) {
      if (typeof isPublic !== "undefined") updateData.isPublic = isPublic;
      if (typeof publicRole !== "undefined") updateData.publicRole = publicRole;
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    /**
     * Broadcast the update to all connected users in the note's room via Socket.io.
     */
    const io = getIO(req);
    if (io) {
      io.to(`note_${id}`).emit("note_updated", updatedNote);

      /**
       * If sharing settings changed, trigger an access check for connected clients.
       */
      if (isOwner && (isPublic === false || (publicRole && publicRole !== note.publicRole))) {
        io.to(`note_${id}`).emit("check_access", { noteId: id });
      }
    }

    res.json({ 
      ...updatedNote, 
      role: isOwner ? "OWNER" : (userPermission?.role || (note.isPublic ? note.publicRole : "VIEWER")) 
    });
  } catch (error) {
    console.error(`[Error] updateNote failed:`, error);
    res.status(400).json({ error: "Failed to update note: " + error.message });
  }
};

/**
 * Deletes a note by ID.
 * Only the owner can delete a note.
 * 
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - Note ID.
 * @param {Object} res - Express response object.
 */
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    /**
     * Notify all collaborators/viewers in the room that the note will be deleted.
     */
    const io = getIO(req);
    if (io) {
      io.to(`note_${id}`).emit('note_deleted', { noteId: id });
    }

    await prisma.note.delete({ where: { id, ownerId: req.user.id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note: ' + error.message });
  }
};
