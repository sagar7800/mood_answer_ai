function notFound(req, res) {
  res.status(404).render("error", {
    title: "Page not found | MoodAnswer AI",
    status: 404,
    message: "The page you are looking for does not exist.",
  });
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : error.message || "Server error.";

  if (req.originalUrl.startsWith("/api/")) {
    res.status(status).json({ error: message });
    return;
  }

  res.status(status).render("error", {
    title: `${status} | MoodAnswer AI`,
    status,
    message,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
