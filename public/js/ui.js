const MoodAnswerUi = (() => {
  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanDisplayText(text, labels) {
    const labelList = Array.isArray(labels) ? labels : [labels];

    return labelList
      .filter(Boolean)
      .reduce((value, label) => {
        const escaped = String(label).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return value.replace(new RegExp(`^${escaped}:\\s*`, "i"), "");
      }, String(text || "").trim())
      .trim();
  }

  function formatHistoryDate(value) {
    if (!value) {
      return "Saved";
    }

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  return {
    escapeHtml,
    cleanDisplayText,
    formatHistoryDate,
  };
})();

window.MoodAnswerUi = MoodAnswerUi;
