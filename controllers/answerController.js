const { generateAnswer } = require("../services/aiService");
const { saveAnswer, getHistory, deleteHistoryItem } = require("../services/historyService");
const { getCurrentUser } = require("../middleware/auth");

async function createAnswer(req, res) {
  const user = getCurrentUser(req);
  const {
    question,
    mood,
    language,
    answerLength,
    humorMode,
    supportiveLine,
    studyMode,
    focusMode,
    assistantMode,
    roomName,
    gameMode,
  } = req.body;

  const settings = {
    language,
    answerLength,
    humorMode,
    supportiveLine,
    studyMode,
    focusMode,
    assistantMode,
    roomName,
    gameMode,
    loginMode: "Logged in",
  };
  const generated = await generateAnswer(question, mood, settings);

  await saveAnswer(user.username, {
    question,
    mood,
    language: settings.language,
    answerLength: settings.answerLength,
    humorMode: settings.humorMode,
    supportiveLineEnabled: settings.supportiveLine,
    studyMode: settings.studyMode,
    focusMode: settings.focusMode,
    assistantMode: settings.assistantMode,
    roomName: settings.roomName,
    gameMode: settings.gameMode,
    provider: generated.provider,
    answer: generated.answer,
    example: generated.example,
    lightJoke: generated.lightJoke,
    supportiveLine: generated.supportiveLine,
    moodFriendlyLine: generated.moodFriendlyLine,
    quickActions: generated.quickActions,
    metadata: generated.metadata,
  });

  res.json({
    title: generated.title,
    answer: generated.answer,
    example: generated.example,
    moodFriendlyLine: generated.moodFriendlyLine,
    lightJoke: generated.lightJoke,
    supportiveLine: generated.supportiveLine,
    quickActions: generated.quickActions,
    metadata: generated.metadata,
  });
}

async function history(req, res) {
  const user = getCurrentUser(req);
  const historyItems = await getHistory(user.username, req.query.limit);
  res.json({ history: historyItems });
}

async function deleteHistory(req, res) {
  const user = getCurrentUser(req);
  const deleted = await deleteHistoryItem(user.username, req.params.id);

  if (!deleted) {
    res.status(404).json({ error: "History item not found." });
    return;
  }

  res.json({ ok: true });
}

module.exports = {
  createAnswer,
  history,
  deleteHistory,
};
