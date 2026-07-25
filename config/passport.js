const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { authenticateUser, findSessionUserById } = require("../services/userService");

function configurePassport() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "identifier",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, identifier, password, done) => {
        try {
          const loginId = identifier || req.body.username;
          const user = await authenticateUser(loginId, password);

          if (!user) {
            return done(null, false, { message: "Username or password is wrong." });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findSessionUserById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
}

module.exports = {
  passport,
  configurePassport,
};
