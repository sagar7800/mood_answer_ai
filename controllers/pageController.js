const { getCurrentUser } = require("../middleware/auth");

const publicPages = {
  login: { view: "login", title: "Login | MoodAnswer AI" },
  signup: { view: "signup", title: "Signup | MoodAnswer AI" },
};

const protectedPages = {
  home: { view: "home", title: "MoodAnswer AI" },
  ask: { view: "ask", title: "Ask | MoodAnswer AI" },
  chat: { view: "chat", title: "Chat | MoodAnswer AI" },
  rooms: { view: "rooms", title: "Rooms | MoodAnswer AI" },
  games: { view: "games", title: "Games | MoodAnswer AI" },
  features: { view: "features", title: "Features | MoodAnswer AI" },
  history: { view: "history", title: "History | MoodAnswer AI" },
  settings: { view: "settings", title: "Settings | MoodAnswer AI" },
};

function renderPage(page) {
  return (req, res) => {
    res.render(page.view, {
      title: page.title,
      currentUser: getCurrentUser(req),
    });
  };
}

module.exports = {
  publicPages,
  protectedPages,
  renderPage,
};
