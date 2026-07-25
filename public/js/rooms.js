const MoodAnswerRooms = (() => {
  const profiles = {
    "Late Night Talk": {
      title: "Late Night Talk",
      mood: "tired",
      language: "Hinglish",
      hero: "Slow, cozy conversations for late-night thoughts.",
      placeholder: "Share a random late-night thought...",
      theme: "soft-night",
    },
    "Motivation Room": {
      title: "Motivation Room",
      mood: "normal",
      language: "Hinglish",
      hero: "Small progress, clean energy, and focused action.",
      placeholder: "Tell me what you want to start...",
      theme: "energetic-orange",
    },
    "Coding Help": {
      title: "Coding Help",
      mood: "confused",
      language: "English",
      hero: "Debug, learn, and build with beginner-friendly guidance.",
      placeholder: "Ask a coding question...",
      theme: "code-dark",
    },
    "Anime Zone": {
      title: "Anime Zone",
      mood: "excited",
      language: "Hinglish",
      hero: "Anime talk, character debates, and dramatic reactions.",
      placeholder: "Talk anime, characters, or recommendations...",
      theme: "anime-pop",
    },
    "Meme Zone": {
      title: "Meme Zone",
      mood: "bored",
      language: "Hinglish",
      hero: "Safe meme energy, punchy jokes, and relatable chaos.",
      placeholder: "Drop a meme mood...",
      theme: "meme-pop",
    },
    "Gaming Lounge": {
      title: "Gaming Lounge",
      mood: "happy",
      language: "Hinglish",
      hero: "Game talk, squad vibes, strategy, and friendly competition.",
      placeholder: "Talk games, builds, or boss fights...",
      theme: "gaming-neon",
    },
    "Study Room": {
      title: "Study Room",
      mood: "confused",
      language: "English",
      hero: "Calm teaching, notes, quizzes, and simple explanations.",
      placeholder: "What topic should we study?",
      theme: "study-focus",
    },
    "Chill Cafe": {
      title: "Chill Cafe",
      mood: "normal",
      language: "Hinglish",
      hero: "Peaceful casual talk with a cozy internet cafe vibe.",
      placeholder: "Start a chill conversation...",
      theme: "chill-cafe",
    },
  };

  return {
    profiles,
    all: Object.values(profiles),
    get(name) {
      return profiles[name] || profiles["Chill Cafe"];
    },
  };
})();

window.MoodAnswerRooms = MoodAnswerRooms;
