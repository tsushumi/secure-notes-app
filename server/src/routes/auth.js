const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth');
const { setAuthCookie, clearAuthCookie } = require('../lib/token');

const router = express.Router();

const BCRYPT_ROUNDS = 12;
// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// POST /api/auth/register
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let user;
    try {
      user = await prisma.user.create({ data: { email, passwordHash, name } });
    } catch (err) {
      // Two simultaneous sign-ups with the same email: the unique index catches the loser.
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      throw err;
    }

    setAuthCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    const isValid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

    if (!user || !isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  })
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Account no longer exists' });
    }
    res.json({ user });
  })
);

module.exports = router;
