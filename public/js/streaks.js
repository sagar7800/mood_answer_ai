const MoodAnswerStreaks = (() => {
  const storageKey = "moodanswerStreakStats";
  const defaultStats = {
    learningStreak: 7,
    questionsAsked: 250,
    gamesCompleted: 15,
    lastActivityDate: "",
  };

  function todayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  function daysBetween(previousDate, nextDate) {
    const previous = new Date(`${previousDate}T00:00:00`);
    const next = new Date(`${nextDate}T00:00:00`);
    return Math.round((next - previous) / 86_400_000);
  }

  function load() {
    try {
      return {
        ...defaultStats,
        ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
      };
    } catch {
      return { ...defaultStats };
    }
  }

  function save(stats) {
    localStorage.setItem(storageKey, JSON.stringify(stats));
    return stats;
  }

  function updateLearningStreak(stats) {
    const currentDate = todayKey();

    if (!stats.lastActivityDate) {
      return {
        ...stats,
        lastActivityDate: currentDate,
      };
    }

    const gap = daysBetween(stats.lastActivityDate, currentDate);

    if (gap === 0) {
      return stats;
    }

    return {
      ...stats,
      learningStreak: gap === 1 ? Number(stats.learningStreak || 0) + 1 : 1,
      lastActivityDate: currentDate,
    };
  }

  function recordActivity(type = "question") {
    const stats = updateLearningStreak(load());
    const nextStats = {
      ...stats,
      questionsAsked:
        type === "question" ? Number(stats.questionsAsked || 0) + 1 : stats.questionsAsked,
      gamesCompleted:
        type === "game" ? Number(stats.gamesCompleted || 0) + 1 : stats.gamesCompleted,
    };

    save(nextStats);
    render(nextStats);
    return nextStats;
  }

  function render(stats = load()) {
    document.querySelectorAll("[data-streak-stat]").forEach((element) => {
      const key = element.dataset.streakStat;
      element.textContent = new Intl.NumberFormat("en-IN").format(Number(stats[key] || 0));
    });
  }

  function init() {
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    load,
    recordActivity,
    render,
  };
})();

window.MoodAnswerStreaks = MoodAnswerStreaks;
