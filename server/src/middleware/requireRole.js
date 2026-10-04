const prisma = require('../lib/prisma');

// Reads the role from the database, not the token, so demoting an admin takes effect immediately.
function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'You do not have permission to do that.' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = requireRole;
