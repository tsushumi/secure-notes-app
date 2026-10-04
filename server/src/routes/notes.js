const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createNoteSchema, updateNoteSchema, listQuerySchema } = require('../validators/notes');

const router = express.Router();

// Every note route requires a logged-in user.
router.use(authenticate);

const NOT_FOUND = { error: 'Note not found' };

// Validates :id and loads the note ONLY if it belongs to the current user.
// A note that doesn't exist and a note that belongs to someone else are indistinguishable
// (both 404), so IDs can't be probed to learn what exists.
async function loadOwnedNote(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(404).json(NOT_FOUND);
  }
  try {
    const note = await prisma.note.findFirst({ where: { id, userId: req.user.userId } });
    if (!note) return res.status(404).json(NOT_FOUND);
    req.note = note;
    next();
  } catch (err) {
    next(err);
  }
}

// GET /api/notes?search=&category=&tag=&sortBy=&order=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid query' });
    }
    const { search, category, tag, sortBy, order } = parsed.data;

    const where = { userId: req.user.userId };
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [notes, meta] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { [sortBy]: order }], // pinned always first
      }),
      // For the filter dropdowns: every category and tag this user has ever used.
      prisma.note.findMany({
        where: { userId: req.user.userId },
        select: { category: true, tags: true },
      }),
    ]);

    res.json({
      notes,
      total: notes.length,
      categories: [...new Set(meta.map((n) => n.category))].sort(),
      tags: [...new Set(meta.flatMap((n) => n.tags))].sort(),
    });
  })
);

// POST /api/notes
router.post(
  '/',
  validate(createNoteSchema),
  asyncHandler(async (req, res) => {
    const note = await prisma.note.create({
      data: { ...req.body, userId: req.user.userId },
    });
    res.status(201).json({ note });
  })
);

// GET /api/notes/:id
router.get('/:id', loadOwnedNote, (req, res) => res.json({ note: req.note }));

// PUT /api/notes/:id
router.put(
  '/:id',
  loadOwnedNote,
  validate(updateNoteSchema),
  asyncHandler(async (req, res) => {
    const note = await prisma.note.update({ where: { id: req.note.id }, data: req.body });
    res.json({ note });
  })
);

// DELETE /api/notes/:id
router.delete(
  '/:id',
  loadOwnedNote,
  asyncHandler(async (req, res) => {
    await prisma.note.delete({ where: { id: req.note.id } });
    res.json({ message: 'Note deleted successfully' });
  })
);

// PATCH /api/notes/:id/pin
router.patch(
  '/:id/pin',
  loadOwnedNote,
  asyncHandler(async (req, res) => {
    const note = await prisma.note.update({
      where: { id: req.note.id },
      data: { isPinned: !req.note.isPinned },
    });
    res.json({ note });
  })
);

// PATCH /api/notes/:id/share  -- toggle the public link on/off
// Turning sharing ON issues a fresh shareId, so any link from an earlier share stays dead.
router.patch(
  '/:id/share',
  loadOwnedNote,
  asyncHandler(async (req, res) => {
    const turningOn = !req.note.isPublic;
    const note = await prisma.note.update({
      where: { id: req.note.id },
      data: turningOn ? { isPublic: true, shareId: crypto.randomUUID() } : { isPublic: false },
    });
    res.json({ note });
  })
);

module.exports = router;
