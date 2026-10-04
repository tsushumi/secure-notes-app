const jwt = require('jsonwebtoken');
const { jwtSecret, isProd, cookieSameSite } = require('../config');

const COOKIE_NAME = 'token';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '24h',
  });
}

function cookieOptions() {
  return {
    httpOnly: true, // JavaScript cannot read it, so XSS cannot steal it
    secure: isProd || cookieSameSite === 'none',
    sameSite: cookieSameSite,
    maxAge: MAX_AGE_MS,
    path: '/',
  };
}

function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
}

function clearAuthCookie(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie, verifyToken };
