const crypto = require("crypto");
const bcrypt = require("bcrypt");

const bcryptRounds = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, bcryptRounds);
}

async function verifyLegacyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedHash = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`${salt}:${key.toString("hex")}`);
    });
  });

  return crypto.timingSafeEqual(Buffer.from(derivedHash), Buffer.from(storedHash));
}

async function verifyPassword(password, storedHash) {
  const hash = String(storedHash || "");

  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compare(password, hash);
  }

  return verifyLegacyPassword(password, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
