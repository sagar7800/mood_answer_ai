function extractSection(text, label, nextLabels = []) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nextPattern = nextLabels
    .map((nextLabel) => `\\n\\s*${nextLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`)
    .join("|");
  const pattern = nextPattern
    ? new RegExp(`(?:^|\\n)\\s*${escapedLabel}:\\s*([\\s\\S]*?)(?=${nextPattern}|$)`, "i")
    : new RegExp(`(?:^|\\n)\\s*${escapedLabel}:\\s*([\\s\\S]*)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function normalizeGeneratedText(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .trim();
}

function cleanOptionalSection(value, label) {
  const cleanValue = normalizeGeneratedText(value);

  if (!cleanValue || /^none\.?$/i.test(cleanValue)) {
    return "";
  }

  return `${label}: ${cleanValue}`;
}

function extractMetadataValue(metadata, label, fallback = "") {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = metadata.match(new RegExp(`${escapedLabel}:\\s*([^\\n]+)`, "i"));
  return match ? match[1].trim() : fallback;
}

function splitExampleOverflow(example) {
  const cleanExample = String(example || "").trim();
  const overflowMatch = cleanExample.match(/\n\s*(Key points|Quick recap|Simple definition):/i);

  if (!overflowMatch || typeof overflowMatch.index !== "number") {
    return {
      example: cleanExample,
      answerExtra: "",
    };
  }

  return {
    example: cleanExample.slice(0, overflowMatch.index).trim(),
    answerExtra: cleanExample.slice(overflowMatch.index).trim(),
  };
}

function parseResponseText(text) {
  let answer = extractSection(text, "Answer", [
    "Example",
    "Mood-friendly line",
    "Optional light humor",
    "Light joke",
    "Supportive line",
    "Quick actions",
    "Metadata for app",
  ]);
  let example = extractSection(text, "Example", [
    "Mood-friendly line",
    "Optional light humor",
    "Light joke",
    "Supportive line",
    "Quick actions",
    "Metadata for app",
  ]);
  const moodFriendlyLine =
    extractSection(text, "Mood-friendly line", [
      "Optional light humor",
      "Light joke",
      "Supportive line",
      "Quick actions",
      "Metadata for app",
    ]) || extractSection(text, "Supportive line", ["Quick actions", "Metadata for app"]);
  const lightJoke =
    extractSection(text, "Optional light humor", [
      "Quick actions",
      "Metadata for app",
      "Supportive line",
    ]) || extractSection(text, "Light joke", ["Supportive line", "Quick actions", "Metadata for app"]);
  const quickActions = extractSection(text, "Quick actions", ["Metadata for app"]);
  const metadata = extractSection(text, "Metadata for app");
  const exampleParts = splitExampleOverflow(example);
  example = exampleParts.example;
  answer = [answer, exampleParts.answerExtra].filter(Boolean).join("\n\n");

  return {
    answer: `Answer: ${normalizeGeneratedText(answer || text)}`,
    example: cleanOptionalSection(example, "Example"),
    moodFriendlyLine: cleanOptionalSection(moodFriendlyLine, "Mood-friendly line"),
    lightJoke: cleanOptionalSection(lightJoke, "Light joke"),
    quickActions: cleanOptionalSection(quickActions, "Quick actions"),
    supportiveLine: cleanOptionalSection(moodFriendlyLine, "Supportive line"),
    metadata: {
      moodUsed: extractMetadataValue(metadata, "Mood used"),
      roomUsed: extractMetadataValue(metadata, "Room used"),
      gameUsed: extractMetadataValue(metadata, "Game used"),
      languageUsed: extractMetadataValue(metadata, "Language used"),
      themeTag: extractMetadataValue(metadata, "Theme tag"),
      historyTitle: extractMetadataValue(metadata, "History title"),
      safetyLevel: extractMetadataValue(metadata, "Safety level", "normal"),
      feedback: extractMetadataValue(
        metadata,
        "Feedback",
        "Helpful | Not helpful | Too long | Too short | Wrong tone",
      ),
    },
  };
}

module.exports = {
  parseResponseText,
};
