// CSRF defence for cookie auth: every state-changing request must carry a custom header.
// Browsers will not attach custom headers on cross-site requests unless CORS allows it,
// and our CORS policy only allows CLIENT_URL.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('x-requested-with') !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Missing required request header.' });
  }
  next();
}

module.exports = csrfGuard;
