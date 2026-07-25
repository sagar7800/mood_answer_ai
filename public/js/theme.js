const MoodAnswerTheme = (() => {
  const settingsKey = "moodanswerSettings";
  const activeThemeKey = "moodanswerActiveTheme";

  const moodThemes = {
    normal: "default-light",
    confused: "clean-indigo",
    stressed: "calm-blue",
    sad: "soft-purple",
    angry: "neutral-gray",
    curious: "energetic-orange",
    tired: "soft-night",
    bored: "fun-chat",
    happy: "default-light",
    excited: "energetic-orange",
  };

  const roomThemes = {
    "Late Night Talk": "soft-night",
    "Motivation Room": "energetic-orange",
    "Coding Help": "code-dark",
    "Anime Zone": "anime-pop",
    "Meme Zone": "meme-pop",
    "Gaming Lounge": "gaming-neon",
    "Study Room": "study-focus",
    "Chill Cafe": "chill-cafe",
    "FunTalk AI": "fun-chat",
  };

  const routeRoomThemes = {
    "late-night-talk": "soft-night",
    "motivation-room": "energetic-orange",
    "coding-help": "code-dark",
    "anime-zone": "anime-pop",
    "meme-zone": "meme-pop",
    "gaming-lounge": "gaming-neon",
    "study-room": "study-focus",
    "chill-cafe": "chill-cafe",
    "fun-talk": "fun-chat",
  };

  const themeMeta = {
    "default-light": { name: "Default Light", color: "#f4f7fb", energy: "balanced" },
    "clean-indigo": { name: "Clean Indigo", color: "#eef4ff", energy: "focused" },
    "calm-blue": { name: "Calm Blue", color: "#eff8ff", energy: "calm" },
    "soft-purple": { name: "Soft Purple", color: "#f7f2ff", energy: "gentle" },
    "neutral-gray": { name: "Neutral Focus", color: "#f6f7f9", energy: "steady" },
    "energetic-orange": { name: "Energetic Orange", color: "#fff7ed", energy: "active" },
    "soft-night": { name: "Soft Night", color: "#0b1220", energy: "low" },
    "fun-chat": { name: "FunTalk Fresh", color: "#ecfeff", energy: "playful" },
    "fun-games": { name: "FunGames Play", color: "#f0fdf4", energy: "playful" },
    "code-dark": { name: "Code Glow", color: "#07111f", energy: "focused" },
    "anime-pop": { name: "Anime Pop", color: "#fff1f8", energy: "expressive" },
    "meme-pop": { name: "Meme Pop", color: "#f7fee7", energy: "playful" },
    "gaming-neon": { name: "Gaming Neon", color: "#090b1a", energy: "high" },
    "study-focus": { name: "Study Focus", color: "#f8fafc", energy: "focused" },
    "chill-cafe": { name: "Chill Cafe", color: "#fbf7f1", energy: "cozy" },
  };

  let controlsBound = false;
  let resizeTimer = 0;

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  }

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function normalizeMood(value) {
    return String(value || "normal").trim().toLowerCase() || "normal";
  }

  function getTimeOfDay(date = new Date()) {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return "morning";
    }

    if (hour >= 17 && hour < 21) {
      return "evening";
    }

    if (hour >= 21 || hour < 5) {
      return "night";
    }

    return "day";
  }

  function getDeviceType() {
    const width = window.innerWidth || document.documentElement.clientWidth || 1024;

    if (width < 640) {
      return "mobile";
    }

    if (width < 1024) {
      return "tablet";
    }

    return "desktop";
  }

  function getCheckedMood() {
    return document.querySelector("input[name='mood']:checked")?.value || "";
  }

  function getSettingsMood() {
    return document.querySelector("select[name='defaultMood']")?.value || "";
  }

  function getSettingsPreference() {
    return document.querySelector("select[name='themePreference']")?.value || "";
  }

  function getRouteTheme() {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const pageSlug = pathParts[pathParts.length - 1] === "index.html"
      ? pathParts[pathParts.length - 2]
      : pathParts[pathParts.length - 1];

    return routeRoomThemes[pageSlug] || "";
  }

  function getProfileTheme(roomName) {
    if (!roomName) {
      return "";
    }

    const profile = window.MoodAnswerRooms?.get?.(roomName);
    return profile?.theme || roomThemes[roomName] || "";
  }

  function applyPreference(theme, preference, mood, timeOfDay) {
    const darkThemes = new Set(["soft-night", "code-dark", "gaming-neon"]);
    const lightFallback = moodThemes[normalizeMood(mood)] || "default-light";

    if (preference === "dark") {
      return darkThemes.has(theme) ? theme : "soft-night";
    }

    if (preference === "light" && darkThemes.has(theme)) {
      return lightFallback === "soft-night" ? "default-light" : lightFallback;
    }

    if (preference === "auto" && timeOfDay === "night" && theme === "default-light") {
      return "soft-night";
    }

    return theme;
  }

  function resolve(context = {}) {
    const params = getParams();
    const savedSettings = readJson(settingsKey);
    const timeOfDay = context.timeOfDay || getTimeOfDay();
    const mood =
      context.mood ||
      params.get("mood") ||
      getCheckedMood() ||
      getSettingsMood() ||
      savedSettings.defaultMood ||
      "normal";
    const assistantMode =
      context.assistantMode ||
      params.get("assistantMode") ||
      document.querySelector("#chatAssistantMode")?.value ||
      "";
    const roomName =
      context.room ||
      context.roomName ||
      params.get("roomName") ||
      document.querySelector("#chatRoomName")?.value ||
      "";
    const gameMode =
      context.gameMode ||
      params.get("gameMode") ||
      document.querySelector("#chatGameMode")?.value ||
      "";
    const preference =
      context.themePreference ||
      getSettingsPreference() ||
      savedSettings.themePreference ||
      "adaptive";

    let theme = getRouteTheme() || moodThemes[normalizeMood(mood)] || "default-light";

    if (assistantMode === "funtalk") {
      theme = "fun-chat";
    }

    if (assistantMode === "fungames" || gameMode) {
      theme = "fun-games";
    }

    if (assistantMode === "rooms" || roomName) {
      theme = getProfileTheme(roomName) || theme;
    }

    theme = applyPreference(theme, preference, mood, timeOfDay);

    return {
      theme,
      themeName: themeMeta[theme]?.name || "Default Light",
      mood: normalizeMood(mood),
      roomName,
      gameMode,
      assistantMode,
      timeOfDay,
      deviceType: getDeviceType(),
      preference,
      energy: themeMeta[theme]?.energy || "balanced",
      themeColor: themeMeta[theme]?.color || "#f4f7fb",
    };
  }

  function updateThemeColor(color) {
    let meta = document.querySelector("meta[name='theme-color']");

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.append(meta);
    }

    meta.content = color;
  }

  function apply(context = {}) {
    const resolved = resolve(context);
    const root = document.documentElement;

    root.dataset.theme = resolved.theme;
    root.dataset.themeName = resolved.themeName;
    root.dataset.mood = resolved.mood;
    root.dataset.time = resolved.timeOfDay;
    root.dataset.device = resolved.deviceType;
    root.dataset.energy = resolved.energy;

    updateThemeColor(resolved.themeColor);
    localStorage.setItem(activeThemeKey, JSON.stringify(resolved));
    window.dispatchEvent(new CustomEvent("moodanswer:themechange", { detail: resolved }));

    return resolved;
  }

  function bindControls() {
    if (controlsBound) {
      return;
    }

    controlsBound = true;

    document.addEventListener("change", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (
        target.matches("input[name='mood']") ||
        target.matches("select[name='defaultMood']") ||
        target.matches("select[name='themePreference']")
      ) {
        apply({
          mood: getCheckedMood() || getSettingsMood(),
          themePreference: getSettingsPreference(),
        });
      }
    });

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => apply(), 160);
    });
  }

  function init() {
    bindControls();
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    apply,
    resolve,
    getTimeOfDay,
  };
})();

window.MoodAnswerTheme = MoodAnswerTheme;
