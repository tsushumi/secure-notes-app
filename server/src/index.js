const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { port, clientUrl, isProd } = require('./config');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const csrfGuard = require('./middleware/csrf');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();

app.disable('x-powered-by');
// Behind Render/Railway's proxy, req.ip would otherwise be the proxy's IP and every user would share one rate-limit bucket.
if (isProd) app.set('trust proxy', 1);

// 1. Security headers
app.use(helmet());

// 2. CORS comes BEFORE the rate limiter so 429 responses still carry CORS headers
//    (otherwise the browser shows a confusing CORS error instead of "too many requests").
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
  })
);

// 3. Rate limiting
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Parsers (10,000 chars of content can exceed 10kb with multi-byte characters, so allow a bit more)
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// 5. CSRF guard for cookie-authenticated, state-changing requests
app.use('/api', csrfGuard);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Optional: if the React app has been built, serve it from this server too.
// One origin for UI and API means no cross-site cookie problems in production.
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// Error handler: log details server-side, send nothing revealing to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
