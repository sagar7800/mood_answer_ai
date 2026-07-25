const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    mood: String,
    language: String,
    answerLength: String,
    humorMode: Boolean,
    supportiveLineEnabled: Boolean,
    studyMode: Boolean,
    focusMode: Boolean,
    assistantMode: String,
    roomName: String,
    gameMode: String,
    provider: String,
    answer: String,
    example: String,
    lightJoke: String,
    supportiveLine: String,
    moodFriendlyLine: String,
    quickActions: String,
    metadata: {
      moodUsed: String,
      roomUsed: String,
      gameUsed: String,
      languageUsed: String,
      themeTag: String,
      historyTitle: String,
      safetyLevel: String,
      feedback: String,
    },
  },
  { timestamps: true },
);

answerSchema.index({ username: 1, createdAt: -1 });

module.exports = mongoose.model("Answer", answerSchema);
