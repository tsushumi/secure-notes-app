const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/admin/stats  (ADMIN only)
// Admins get aggregate counts, never anyone's note content.
router.get(
  '/stats',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const [users, notes, publicNotes] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.note.count({ where: { isPublic: true } }),
    ]);
    res.json({ users, notes, publicNotes });
  })
);

module.exports = router;
