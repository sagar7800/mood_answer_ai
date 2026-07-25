const env = require("../config/env");
const { parseResponseText } = require("../utils/textParser");

const moodAnswerInstructions = `You are MoodAnswer AI, a mood-aware question-answering assistant.

Answer correctly, clearly, safely, and in the user's selected language style.

Mood rules:
- Normal: clear and natural.
- Confused: simple, slow, step-by-step, with an easy example.
- Stressed: calm, short, reassuring, and not overloaded.
- Sad: gentle, warm, and supportive.
- Angry: respectful, direct, calm, and non-argumentative.
- Curious: deeper explanation with useful details.
- Tired: very short and easy to read.

Feature rules:
1. Respect answer length: Short, Medium, or Detailed.
2. If Study mode is ON, use Simple definition, Example, Key points, Quick recap inside the Answer section.
3. If Study mode is OFF, answer naturally without study headings unless directly requested.
4. If Focus mode is ON, give only 3 to 5 important points.
5. If Humor mode is ON and the topic is safe, add one small friendly joke or funny analogy.
6. Never add humor for health, death, depression, accident, legal, financial loss, emergency, violence, abuse, or self-harm topics.
7. If harmful, illegal, unsafe, or self-harm related, refuse safely and offer a safe alternative.
8. If medical, legal, financial, or current-news related, be careful and recommend a trusted expert/source.
9. Do not manipulate emotions, make false claims, or make fun of the user.

Output exactly:
Answer:
[main answer]

Example:
[short example if useful, otherwise None]

Mood-friendly line:
[one short supportive line if enabled, otherwise None]

Optional light humor:
[one safe small joke if enabled and appropriate, otherwise None]

Quick actions:
[3 to 5 action labels separated by commas]

Metadata for app:
Mood used: [mood]
Language used: [language]
Theme tag: [theme tag]
History title: [short title]
Safety level: [normal / sensitive / unsafe]
Feedback: Helpful | Not helpful | Too long | Too short | Wrong tone`;

const funTalkInstructions = `You are FunTalk AI, a friendly and safe casual conversation companion inside MoodAnswer AI.

Keep the reply fun, refreshing, short-to-medium, and emotionally safe. You can use light jokes, memes, fun questions, gaming/movie/anime/music talk, safe roasts, quizzes, and casual Hinglish if the user uses it.

Never become romantic, possessive, emotionally dependent, manipulative, explicit, hateful, or unsafe. If the user is sad or stressed, stay gentle and avoid harsh jokes.

Output exactly:
Answer:
[natural casual reply]

Example:
[only if useful, otherwise None]

Mood-friendly line:
[one friendly line if useful, otherwise None]

Optional light humor:
[one safe playful twist if appropriate, otherwise None]

Quick actions:
[Joke mode, Chill talk, Random question, Would you rather, Roast mode]

Metadata for app:
Mood used: [mood]
Language used: [language]
Theme tag: fun-chat
History title: [short title]
Safety level: [normal / sensitive / unsafe]
Feedback: Helpful | Not helpful | Too long | Too short | Wrong tone`;

const adaptiveRoomsInstructions = `You are Adaptive AI Rooms inside MoodAnswer AI.

Selected room controls personality:
- Late Night Talk: calm, cozy, thoughtful, safe.
- Motivation Room: uplifting, focused, encouraging without pressure.
- Coding Help: practical, beginner-friendly, structured debugging.
- Anime Zone: energetic, expressive anime-fan vibe without toxic fandom hate.
- Meme Zone: safe meme energy, short punchy humor.
- Gaming Lounge: friendly gamer energy, no toxicity.
- Study Room: calm teacher, notes, summaries, quizzes, simple structure.
- Chill Cafe: peaceful, relaxing, cozy casual conversation.

Always stay safe, respectful, non-romantic, non-dependent, and match English/Hindi/Hinglish.

Output exactly:
Answer:
[room-based reply]

Example:
[if useful, otherwise None]

Mood-friendly line:
[one short line if useful, otherwise None]

Optional light humor:
[only if safe and appropriate, otherwise None]

Quick actions:
[3 to 5 room-relevant action labels]

Metadata for app:
Mood used: [mood]
Room used: [room]
Language used: [language]
Theme tag: [room or mood tag]
History title: [short title]
Safety level: [normal / sensitive / unsafe]
Feedback: Helpful | Not helpful | Too long | Too short | Wrong tone`;

const funGamesInstructions = `You are FunGames AI inside MoodAnswer AI.

Create safe, entertaining, short interactive mini-game rounds. Supported games: Truth or Dare, Quiz Challenge, Guessing Game, Emoji Game, Riddles, Would You Rather, Rapid Fire, Meme Challenge, Word Association, This or That.

Rules: keep all games friendly, non-explicit, non-dangerous, non-hateful, non-humiliating, and match English/Hindi/Hinglish. Adapt difficulty and energy to mood.

Output exactly:
Answer:
[one playable round or response]

Example:
[if useful, otherwise None]

Mood-friendly line:
[one short friendly line if useful, otherwise None]

Optional light humor:
[one safe playful line if appropriate, otherwise None]

Quick actions:
[Next Round, Change Game, Easier, Harder, Hint]

Metadata for app:
Mood used: [mood]
Game used: [game]
Language used: [language]
Theme tag: fun-games
History title: [short title]
Safety level: [normal / sensitive / unsafe]
Feedback: Helpful | Not helpful | Too long | Too short | Wrong tone`;

function getSystemInstructions(settings) {
  if (settings.assistantMode === "funtalk") {
    return funTalkInstructions;
  }

  if (settings.assistantMode === "rooms") {
    return adaptiveRoomsInstructions;
  }

  if (settings.assistantMode === "fungames") {
    return funGamesInstructions;
  }

  return moodAnswerInstructions;
}

function buildUserPrompt(question, mood, settings) {
  return `User input:
Assistant mode: ${settings.assistantMode}
Selected room: ${settings.roomName || "None"}
Selected game: ${settings.gameMode || "None"}
Question: ${question}
Mood: ${mood}
Language: ${settings.language}
Answer length: ${settings.answerLength}
Humor mode: ${settings.humorMode ? "ON" : "OFF"}
Supportive line: ${settings.supportiveLine ? "ON" : "OFF"}
Study mode: ${settings.studyMode ? "ON" : "OFF"}
Focus mode: ${settings.focusMode ? "ON" : "OFF"}
Login mode: ${settings.loginMode}`;
}

function isRetriableGeminiError(error) {
  const message = String(error.message || "").toLowerCase();
  return (
    error.status === 429 ||
    error.status === 503 ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("temporarily unavailable")
  );
}

async function callGeminiModel(modelName, question, mood, settings) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: getSystemInstructions(settings) }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildUserPrompt(question, mood, settings) }],
          },
        ],
      }),
    },
  );
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "Gemini API request failed.");
    error.status = response.status;
    throw error;
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini API returned an empty answer.");
  }

  return {
    provider: `Google AI Studio Gemini (${modelName})`,
    text,
  };
}

async function callGemini(question, mood, settings) {
  let lastError;

  for (const modelName of env.geminiModels) {
    try {
      return await callGeminiModel(modelName, question, mood, settings);
    } catch (error) {
      lastError = error;

      if (!isRetriableGeminiError(error)) {
        throw error;
      }
    }
  }

  throw new Error(
    `Gemini is temporarily busy across fallback models. Last error: ${lastError?.message || "unknown error"}`,
  );
}

async function callOpenRouter(question, mood, settings) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "MoodAnswer AI",
    },
    body: JSON.stringify({
      model: env.openRouterModel,
      messages: [
        { role: "system", content: getSystemInstructions(settings) },
        { role: "user", content: buildUserPrompt(question, mood, settings) },
      ],
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter API request failed.");
  }

  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("OpenRouter API returned an empty answer.");
  }

  return {
    provider: "OpenRouter free API",
    text,
  };
}

function getAnswerTitle(settings) {
  if (settings.assistantMode === "funtalk") {
    return "FunTalk AI reply";
  }

  if (settings.assistantMode === "rooms") {
    return `${settings.roomName || "AI Room"} reply`;
  }

  if (settings.assistantMode === "fungames") {
    return `${settings.gameMode || "FunGames AI"} round`;
  }

  return "MoodAnswer AI answer";
}

async function generateAnswer(question, mood, settings) {
  if (!env.geminiApiKey && !env.openRouterApiKey) {
    const error = new Error("API key missing. Add GEMINI_API_KEY to .env, then restart the server.");
    error.status = 400;
    throw error;
  }

  const generated = env.geminiApiKey
    ? await callGemini(question, mood, settings)
    : await callOpenRouter(question, mood, settings);
  const parsedAnswer = parseResponseText(generated.text);

  return {
    title: getAnswerTitle(settings),
    provider: generated.provider,
    ...parsedAnswer,
  };
}

module.exports = {
  generateAnswer,
};
