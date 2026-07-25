const mongoose = require("mongoose");
const env = require("./env");
const { ensureAdminUser } = require("../services/userService");

async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    if (env.mongoUri === env.localMongoUri) {
      throw error;
    }

    console.warn("Primary MongoDB connection failed. Falling back to local MongoDB.");
    console.warn(error.message);
    await mongoose.connect(env.localMongoUri, {
      dbName: env.mongoDbName,
      serverSelectionTimeoutMS: 10000,
    });
  }

  await ensureAdminUser();
}

module.exports = connectDatabase;
