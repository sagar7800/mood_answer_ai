const express = require("express");
const authController = require("../controllers/authController");
const answerController = require("../controllers/answerController");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { validateBody, validateQuery, validateParams } = require("../middleware/validate");
const { loginSchema, signupSchema } = require("../validators/authValidator");
const { answerSchema, historyQuerySchema, historyParamSchema } = require("../validators/answerValidator");

const router = express.Router();

router.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
router.post("/signup", validateBody(signupSchema), asyncHandler(authController.signup));
router.post("/logout", authController.logout);
router.get("/session", authController.session);
router.post("/answer", requireAuth, validateBody(answerSchema), asyncHandler(answerController.createAnswer));
router.get(
  "/history",
  requireAuth,
  validateQuery(historyQuerySchema),
  asyncHandler(answerController.history),
);
router.delete(
  "/history/:id",
  requireAuth,
  validateParams(historyParamSchema),
  asyncHandler(answerController.deleteHistory),
);

module.exports = router;
