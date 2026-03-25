const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to get Socket.io from request
const getIO = (req) => req.app.get('io');

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

    // Map to include role
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

    // Access check: Owner OR Public OR has explicit Permission
    const isOwner = req.user && note.ownerId === req.user.id;
    const hasPermission = req.user && note.permissions.some(p => p.userId === req.user.id);

    if (!isOwner && !note.isPublic && !hasPermission) {
      return res.status(403).json({ error: 'Access restricted' });
    }

    // Determine role for the response
    let role = 'VIEWER';
    if (isOwner) role = 'OWNER';
    else if (hasPermission) role = note.permissions.find(p => p.userId === req.user.id).role;
    else if (note.isPublic) role = note.publicRole;

    res.json({ ...note, role });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch note: ' + error.message });
  }
};

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

    // Notify target user
    const io = getIO(req);
    if (io) {
      io.to(`user_${targetUser.id}`).emit('access_changed', { noteId: id, role });
    }

    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: 'Failed to share: ' + error.message });
  }
};

exports.removePermission = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const note = await prisma.note.findUnique({ where: { id } });
    if (note.ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.permission.delete({
      where: { userId_noteId: { userId, noteId: id } },
    });

    // Notify target user that access is revoked
    const io = getIO(req);
    if (io) {
      io.to(`user_${userId}`).emit('access_revoked', { noteId: id });
    }

    res.json({ message: 'Permission removed' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to remove permission' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPublic, publicRole } = req.body;
    const note = await prisma.note.findUnique({ where: { id } });
    if (note.ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content, isPublic, publicRole },
    });

    // If made private, we might need to kick anonymous or unauthorized users.
    // For now, let's at least broadcast the update to the note room.
    const io = getIO(req);
    if (io) {
      io.to(`note_${id}`).emit('note_updated', updatedNote);

      if (isPublic === false || publicRole !== note.publicRole) {
        // Force re-verification for any privacy or role change
        io.to(`note_${id}`).emit('check_access', { noteId: id });
      }
    }

    res.json({ ...updatedNote, role: 'OWNER' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update note: ' + error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Notify all collaborators/viewers in the room
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
