const MongoStoreModule = require("connect-mongo");
const env = require("./env");

const oneDay = 1000 * 60 * 60 * 24;
const MongoStore =
  MongoStoreModule.default || MongoStoreModule.MongoStore || MongoStoreModule;

function createSessionStore() {
  return MongoStore.create({
    mongoUrl: env.mongoUri,
    dbName: env.mongoDbName,
    collectionName: "sessions",
    ttl: 60 * 60 * 24,
    autoRemove: "native",
    touchAfter: 60 * 15,
  });
}

function createSessionConfig() {
  return {
    name: "connect.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    proxy: env.nodeEnv === "production",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      maxAge: oneDay,
    },
  };
}

module.exports = createSessionConfig;
