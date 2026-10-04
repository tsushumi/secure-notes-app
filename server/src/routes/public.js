const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

const SHARE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/public/notes/:shareId  (no auth)
// Returns only fields safe to show a stranger: no id, userId, email, or author details.
router.get(
  '/notes/:shareId',
  asyncHandler(async (req, res) => {
    const { shareId } = req.params;
    const notFound = () => res.status(404).json({ error: 'This note is not available' });
    if (!SHARE_ID.test(shareId)) return notFound();

    const note = await prisma.note.findFirst({
      where: { shareId, isPublic: true },
      select: { title: true, content: true, category: true, tags: true, updatedAt: true },
    });
    if (!note) return notFound();

    res.json({ note });
  })
);

module.exports = router;
