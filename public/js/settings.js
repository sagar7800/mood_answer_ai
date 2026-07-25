const MoodAnswerSettings = (() => {
  const key = "moodanswerSettings";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  }

  function save(settings) {
    localStorage.setItem(key, JSON.stringify(settings));
  }

  function init() {
    const form = document.querySelector("#settingsForm");
    const message = document.querySelector("#settingsMessage");
    const sessionUser = document.querySelector("#sessionUser");
    const logoutButton = document.querySelector("#logoutButton");

    if (!form) {
      return;
    }

    if (window.location.protocol !== "file:") {
      MoodAnswerApi.getSession().then((data) => {
        if (!data.authenticated) {
          window.location.href = "/login";
          return;
        }

        if (sessionUser) {
          sessionUser.textContent = data.displayName || data.username || "User";
        }
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        await MoodAnswerApi.logout();
        window.location.href = "/login";
      });
    }

    const current = load();
    Object.entries(current).forEach(([name, value]) => {
      const field = form.elements[name];

      if (!field) {
        return;
      }

      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });

    window.MoodAnswerTheme?.apply({
      mood: current.defaultMood,
      themePreference: current.themePreference,
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);

      const settings = {
        defaultMood: data.get("defaultMood"),
        defaultLanguage: data.get("defaultLanguage"),
        answerLength: data.get("answerLength"),
        themePreference: data.get("themePreference"),
        humorMode: data.has("humorMode"),
        supportiveLine: data.has("supportiveLine"),
      };

      save(settings);
      window.MoodAnswerTheme?.apply({
        mood: settings.defaultMood,
        themePreference: settings.themePreference,
      });

      if (message) {
        message.textContent = "Settings saved.";
      }
    });
  }

  return {
    load,
    save,
    init,
  };
})();

window.MoodAnswerSettings = MoodAnswerSettings;
MoodAnswerSettings.init();
