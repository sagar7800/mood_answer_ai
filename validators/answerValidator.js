const Joi = require("joi");

const answerSchema = Joi.object({
  question: Joi.string().trim().min(1).max(5000).required().messages({
    "string.empty": "Question is required.",
    "any.required": "Question is required.",
  }),
  mood: Joi.string()
    .trim()
    .valid("normal", "confused", "stressed", "sad", "angry", "curious", "tired", "happy", "bored", "excited")
    .required()
    .messages({
      "any.only": "Please select a valid mood.",
      "any.required": "Mood is required.",
    }),
  language: Joi.string().trim().valid("English", "Hindi", "Hinglish").default("English"),
  answerLength: Joi.string().trim().valid("Short", "Medium", "Detailed").default("Medium"),
  humorMode: Joi.boolean().truthy("true", "on", "yes", "1").falsy("false", "off", "no", "0").default(true),
  supportiveLine: Joi.boolean().truthy("true", "on", "yes", "1").falsy("false", "off", "no", "0").default(true),
  studyMode: Joi.boolean().truthy("true", "on", "yes", "1").falsy("false", "off", "no", "0").default(false),
  focusMode: Joi.boolean().truthy("true", "on", "yes", "1").falsy("false", "off", "no", "0").default(false),
  assistantMode: Joi.string().trim().valid("moodanswer", "funtalk", "rooms", "fungames").default("moodanswer"),
  roomName: Joi.string().trim().max(80).allow("").default(""),
  gameMode: Joi.string().trim().max(80).allow("").default(""),
});

const historyQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const historyParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid history item.",
    "string.length": "Invalid history item.",
    "any.required": "History item is required.",
  }),
});

module.exports = {
  answerSchema,
  historyQuerySchema,
  historyParamSchema,
};
