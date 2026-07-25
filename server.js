const app = require("./app");

app.startServer().catch((error) => {
  console.error("Could not start MoodAnswer AI.");
  console.error(error.message);
  process.exit(1);
});
