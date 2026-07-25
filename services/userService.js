const env = require("../config/env");
const User = require("../models/User");
const { verifyPassword } = require("../utils/password");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function createUsernameFromEmail(email) {
  const baseUsername =
    normalizeEmail(email)
      .split("@")[0]
      .replace(/[^a-z0-9_]/gi, "")
      .toLowerCase() || "user";
  let username = baseUsername;
  let suffix = 1;

  while (await User.exists({ username })) {
    username = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  return username;
}

function toSessionUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    displayName: user.displayName || user.username,
    role: user.role || "user",
  };
}

async function ensureAdminUser() {
  const username = String(env.loginUsername || "admin").trim().toLowerCase();
  const email = normalizeEmail(env.loginEmail || `${username}@moodwise.local`);
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    existingUser.email = existingUser.email || email;
    existingUser.displayName = existingUser.displayName || "Admin";
    existingUser.role = existingUser.role || "admin";
    await existingUser.save();
    return;
  }

  const adminUser = new User({
    username,
    email,
    displayName: "Admin",
    role: "admin",
  });

  await User.register(adminUser, env.loginPassword);
}

async function findByLoginId(loginId, includePassword = false) {
  const normalizedLoginId = String(loginId || "").trim();
  const email = normalizeEmail(normalizedLoginId);

  const query = User.findOne({
    $or: [{ username: normalizedLoginId.toLowerCase() }, { email }],
  });

  if (includePassword) {
    query.select("+passwordHash +passwordSalt");
  }

  return query;
}

async function authenticateUser(loginId, password) {
  const normalizedLoginId = String(loginId || "").trim();
  const { user: pluginUser } = await User.authenticate()(normalizedLoginId, password);

  if (pluginUser) {
    return toSessionUser(pluginUser);
  }

  const user = await findByLoginId(normalizedLoginId, true);

  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  if (typeof user.setPassword === "function") {
    await user.setPassword(password);
    await user.save();
  }

  return toSessionUser(user);
}

async function findSessionUserById(id) {
  if (!id) {
    return null;
  }

  const user = await User.findById(id);
  return user ? toSessionUser(user) : null;
}

async function createUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.status = 409;
    throw error;
  }

  const username = await createUsernameFromEmail(normalizedEmail);
  const user = new User({
    username,
    email: normalizedEmail,
    displayName: String(name || "").trim() || username,
    role: "user",
  });

  const registeredUser = await User.register(user, password);
  return toSessionUser(registeredUser);
}

module.exports = {
  ensureAdminUser,
  authenticateUser,
  findSessionUserById,
  createUser,
};
