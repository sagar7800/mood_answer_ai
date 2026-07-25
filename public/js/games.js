const MoodAnswerGames = (() => {
  const profiles = {
    "Truth or Dare": {
      title: "Truth or Dare",
      hero: "Safe truths and harmless playful dares.",
      placeholder: "Type truth, dare, or next round...",
      difficulty: "easy",
      energy: "playful",
    },
    "Quiz Challenge": {
      title: "Quiz Challenge",
      hero: "Quick quiz rounds with score, streaks, and levels.",
      placeholder: "Choose a category or type next question...",
      difficulty: "medium",
      energy: "focused",
    },
    "Guessing Game": {
      title: "Guessing Game",
      hero: "Clues first, then you guess the answer.",
      placeholder: "Ask for a clue or make your guess...",
      difficulty: "easy",
      energy: "curious",
    },
    "Emoji Game": {
      title: "Emoji Game",
      hero: "Guess movies, anime, songs, games, or phrases from emojis.",
      placeholder: "Guess the emoji clue...",
      difficulty: "easy",
      energy: "fast",
    },
    Riddles: {
      title: "Riddles",
      hero: "Easy-to-medium riddles that stay fun.",
      placeholder: "Answer the riddle or ask for a hint...",
      difficulty: "medium",
      energy: "thoughtful",
    },
    "Would You Rather": {
      title: "Would You Rather",
      hero: "Funny choices with safe, interesting tradeoffs.",
      placeholder: "Pick one option or ask next...",
      difficulty: "easy",
      energy: "playful",
    },
    "Rapid Fire": {
      title: "Rapid Fire",
      hero: "Fast questions, quick replies, high energy.",
      placeholder: "Answer quickly or type next...",
      difficulty: "easy",
      energy: "fast",
    },
    "Meme Challenge": {
      title: "Meme Challenge",
      hero: "Relatable meme situations and safe internet humor.",
      placeholder: "Drop a situation or ask for a meme prompt...",
      difficulty: "easy",
      energy: "chaotic-safe",
    },
    "Word Association": {
      title: "Word Association",
      hero: "Continue the chain with related words.",
      placeholder: "Reply with the first related word...",
      difficulty: "easy",
      energy: "calm",
    },
    "This or That": {
      title: "This or That",
      hero: "Simple quick choices for an easy game vibe.",
      placeholder: "Pick this or that...",
      difficulty: "easy",
      energy: "cozy",
    },
  };

  return {
    profiles,
    all: Object.values(profiles),
    get(name) {
      return profiles[name] || profiles["Quiz Challenge"];
    },
  };
})();

window.MoodAnswerGames = MoodAnswerGames;
