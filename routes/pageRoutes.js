const express = require("express");
const { publicPages, protectedPages, renderPage } = require("../controllers/pageController");
const { requireAuth, redirectIfAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/login", redirectIfAuthenticated, renderPage(publicPages.login));
router.get("/login.html", redirectIfAuthenticated, renderPage(publicPages.login));
router.get("/signup", redirectIfAuthenticated, renderPage(publicPages.signup));
router.get("/signup.html", redirectIfAuthenticated, renderPage(publicPages.signup));

router.get("/", requireAuth, renderPage(protectedPages.home));
router.get("/index.html", requireAuth, renderPage(protectedPages.home));
router.get("/ask", requireAuth, renderPage(protectedPages.ask));
router.get("/ask.html", requireAuth, renderPage(protectedPages.ask));
router.get("/chat", requireAuth, renderPage(protectedPages.chat));
router.get("/chat.html", requireAuth, renderPage(protectedPages.chat));
router.get("/fun", requireAuth, renderPage(protectedPages.chat));
router.get("/room-chat", requireAuth, renderPage(protectedPages.chat));
router.get("/game-chat", requireAuth, renderPage(protectedPages.chat));
router.get("/rooms", requireAuth, renderPage(protectedPages.rooms));
router.get("/rooms.html", requireAuth, renderPage(protectedPages.rooms));
router.get("/games", requireAuth, renderPage(protectedPages.games));
router.get("/games.html", requireAuth, renderPage(protectedPages.games));
router.get("/features", requireAuth, renderPage(protectedPages.features));
router.get("/features.html", requireAuth, renderPage(protectedPages.features));
router.get("/history", requireAuth, renderPage(protectedPages.history));
router.get("/history.html", requireAuth, renderPage(protectedPages.history));
router.get("/settings", requireAuth, renderPage(protectedPages.settings));
router.get("/settings.html", requireAuth, renderPage(protectedPages.settings));

module.exports = router;
