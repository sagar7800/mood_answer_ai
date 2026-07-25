function getCurrentUser(req) {
  return req.user || req.session?.user || null;
}

function attachUser(req, res, next) {
  res.locals.currentUser = getCurrentUser(req);
  next();
}

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated?.() || getCurrentUser(req));
}

function requireAuth(req, res, next) {
  if (isAuthenticated(req)) {
    next();
    return;
  }

  if (req.originalUrl.startsWith("/api/")) {
    res.status(401).json({ error: "Please log in first." });
    return;
  }

  res.redirect("/login");
}

function redirectIfAuthenticated(req, res, next) {
  if (isAuthenticated(req)) {
    res.redirect("/");
    return;
  }

  next();
}

module.exports = {
  attachUser,
  requireAuth,
  redirectIfAuthenticated,
  getCurrentUser,
};
