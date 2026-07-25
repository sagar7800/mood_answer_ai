const { passport } = require("../config/passport");
const { createUser } = require("../services/userService");

function sendUser(res, user, status = 200) {
  res.status(status).json({
    username: user.username,
    email: user.email,
    displayName: user.displayName,
  });
}

function login(req, res, next) {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      next(error);
      return;
    }

    if (!user) {
      res.status(401).json({ error: info?.message || "Username or password is wrong." });
      return;
    }

    req.login(user, (loginError) => {
      if (loginError) {
        next(loginError);
        return;
      }

      sendUser(res, user);
    });
  })(req, res, next);
}

async function signup(req, res, next) {
  const user = await createUser(req.body);

  req.login(user, (error) => {
    if (error) {
      next(error);
      return;
    }

    sendUser(res, user, 201);
  });
}

function logout(req, res, next) {
  req.logout((logoutError) => {
    if (logoutError) {
      next(logoutError);
      return;
    }

    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }

      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
}

function session(req, res) {
  const user = req.user || req.session?.user;

  if (!user) {
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
  });
}

module.exports = {
  login,
  signup,
  logout,
  session,
};
