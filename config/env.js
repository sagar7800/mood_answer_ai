const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || "moodanswer-local-session-secret",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  localMongoUri: "mongodb://127.0.0.1:27017",
  mongoDbName: process.env.MONGODB_DB || "moodwise",
  loginUsername: process.env.LOGIN_USERNAME || "admin",
  loginEmail: process.env.LOGIN_EMAIL || "admin@moodwise.local",
  loginPassword: process.env.LOGIN_PASSWORD || "moodwise123",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  geminiFallbackModels:
    process.env.GEMINI_FALLBACK_MODELS ||
    "gemini-2.0-flash-lite,gemini-flash-lite-latest,gemini-2.0-flash",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openRouterModel: process.env.OPENROUTER_MODEL || "openrouter/free",
};

env.geminiModels = [
  ...new Set(
    [env.geminiModel, ...env.geminiFallbackModels.split(",")]
      .map((modelName) => modelName.trim())
      .filter(Boolean),
  ),
];

module.exports = env;
