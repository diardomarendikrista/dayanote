const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotes = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { permissions: { some: { userId: req.user.id } } },
          { isPublic: true },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(notes);
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
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note: ' + error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { permissions: { some: { userId: req.user.id } } },
          { isPublic: true },
        ],
      },
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch note: ' + error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isPublic } = req.body;
    const note = await prisma.note.update({
      where: { id },
      data: { title, isPublic },
    });
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update note: ' + error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.note.delete({ where: { id, ownerId: req.user.id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note: ' + error.message });
  }
};
