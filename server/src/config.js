require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters. Generate one with crypto.randomBytes(32).');
}

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  isProd,
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
};
