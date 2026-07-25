const Answer = require("../models/Answer");
const mongoose = require("mongoose");

async function saveAnswer(username, payload) {
  return Answer.create({
    username,
    ...payload,
  });
}

async function getHistory(username, limit = 10) {
  const history = await Answer.find({ username })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return history.map((item) => ({
    id: String(item._id),
    question: item.question,
    mood: item.mood,
    language: item.language,
    answerLength: item.answerLength,
    assistantMode: item.assistantMode,
    roomName: item.roomName,
    gameMode: item.gameMode,
    answer: item.answer,
    example: item.example,
    lightJoke: item.lightJoke,
    supportiveLine: item.supportiveLine,
    moodFriendlyLine: item.moodFriendlyLine,
    quickActions: item.quickActions,
    metadata: item.metadata || {},
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
  }));
}

async function deleteHistoryItem(username, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const result = await Answer.deleteOne({ _id: id, username });
  return result.deletedCount > 0;
}

module.exports = {
  saveAnswer,
  getHistory,
  deleteHistoryItem,
};
