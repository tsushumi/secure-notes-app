const { COOKIE_NAME, verifyToken } = require('../lib/token');

function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid session.';
    return res.status(401).json({ error: message });
  }
}

module.exports = authenticate;
