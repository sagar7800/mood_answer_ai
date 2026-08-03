const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const morgan = require("morgan");
const env = require("./config/env");
const connectDatabase = require("./config/database");
const { passport, configurePassport } = require("./config/passport");
const createSessionConfig = require("./config/session");
const pageRoutes = require("./routes/pageRoutes");
const apiRoutes = require("./routes/apiRoutes");
const { attachUser } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

configurePassport();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(session(createSessionConfig()));

app.use(passport.initialize());
app.use(passport.session());
app.use(attachUser);
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRoutes);
app.use(pageRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`MoodAnswer AI running at http://localhost:${env.port}`);
    console.log(`Using MongoDB database: ${env.mongoDbName}`);

    if (env.geminiApiKey) {
      console.log(`Using Gemini model: ${env.geminiModel}`);
      return;
    }

    if (env.openRouterApiKey) {
      console.log(`Using OpenRouter model: ${env.openRouterModel}`);
      return;
    }

    console.log("GEMINI_API_KEY is not set yet.");
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Could not start MoodAnswer AI.");
    console.error(error.message);
    process.exit(1);
  });
}

app.startServer = startServer;
module.exports = app;
