const chatForm = document.querySelector("#chatForm");
const chatQuestion = document.querySelector("#chatQuestion");
const chatSubmit = document.querySelector("#chatSubmit");
const flowHero = document.querySelector("#flowHero");
const flowKicker = document.querySelector("#flowKicker");
const flowHeroTitle = document.querySelector("#flowHeroTitle");
const flowHeroText = document.querySelector("#flowHeroText");
const flowChat = document.querySelector("#flowChat");
const flowMessages = document.querySelector("#flowMessages");
const logoutButton = document.querySelector("#logoutButton");
const sessionUser = document.querySelector("#sessionUser");
const newChatLink = document.querySelector("#newChatLink");
const voiceChatMode = document.querySelector("#voiceChatMode");
const flowVoiceStatus = document.querySelector(".flow-voice-status");
const voiceChatStorageKey = "moodanswerVoiceChatMode";
let activeSpeechButton = null;
const typingTimers = new WeakMap();

const moodTypingProfiles = {
  normal: { speed: 1, label: "smooth", messages: ["Thinking...", "Analyzing...", "Writing answer..."] },
  confused: {
    speed: 1.28,
    label: "slow and careful",
    messages: ["Preparing a simple answer...", "Finding an easy example...", "Writing carefully..."],
  },
  stressed: {
    speed: 1.22,
    label: "calm",
    messages: ["Keeping it calm...", "Preparing a short answer...", "Almost ready..."],
  },
  sad: {
    speed: 1.28,
    label: "gentle",
    messages: ["Writing gently...", "Preparing a warm reply...", "Almost ready..."],
  },
  angry: {
    speed: 0.78,
    label: "short and direct",
    messages: ["Getting to the point...", "Writing directly...", "Almost done..."],
  },
  curious: {
    speed: 0.82,
    label: "fast and energetic",
    messages: ["Exploring the idea...", "Adding useful details...", "Generating response..."],
  },
  tired: {
    speed: 1.35,
    label: "slow and relaxed",
    messages: ["Keeping it easy...", "Writing a simple reply...", "Almost ready..."],
  },
};

const chatFields = {
  mood: document.querySelector("#chatMood"),
  language: document.querySelector("#chatLanguage"),
  answerLength: document.querySelector("#chatAnswerLength"),
  humorMode: document.querySelector("#chatHumorMode"),
  supportiveLine: document.querySelector("#chatSupportiveLine"),
  studyMode: document.querySelector("#chatStudyMode"),
  focusMode: document.querySelector("#chatFocusMode"),
  assistantMode: document.querySelector("#chatAssistantMode"),
  roomName: document.querySelector("#chatRoomName"),
  gameMode: document.querySelector("#chatGameMode"),
};
const chatSettingKeys = [
  "mood",
  "language",
  "answerLength",
  "humorMode",
  "supportiveLine",
  "studyMode",
  "focusMode",
  "assistantMode",
  "roomName",
  "gameMode",
];

const roomProfiles = window.MoodAnswerRooms?.profiles || {};
const gameProfiles = window.MoodAnswerGames?.profiles || {};

const localAnswers = [
  {
    keywords: ["operating system", "os"],
    answer:
      "An operating system is the main software that helps a computer or phone work. It manages apps, files, memory, keyboard, screen, and other hardware. Examples include Windows, Android, iOS, macOS, and Linux.",
  },
  {
    keywords: ["ai", "artificial intelligence"],
    answer:
      "AI means artificial intelligence. It is technology that helps computers do tasks that usually need human thinking, such as answering questions, translating text, or finding patterns.",
  },
  {
    keywords: ["website", "web site"],
    answer:
      "A website is a group of web pages that open in a browser. It usually uses HTML for structure, CSS for design, and JavaScript for interaction.",
  },
];

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

function normalizeBoolean(value) {
  return ["true", "on", "yes", "1"].includes(String(value || "").toLowerCase());
}

function getSettings() {
  return {
    mood: chatFields.mood?.value || "normal",
    language: chatFields.language?.value || "English",
    answerLength: chatFields.answerLength?.value || "Medium",
    humorMode: normalizeBoolean(chatFields.humorMode?.value ?? "true"),
    supportiveLine: normalizeBoolean(chatFields.supportiveLine?.value ?? "true"),
    studyMode: normalizeBoolean(chatFields.studyMode?.value),
    focusMode: normalizeBoolean(chatFields.focusMode?.value),
    assistantMode: chatFields.assistantMode?.value || "moodanswer",
    roomName: chatFields.roomName?.value || "",
    gameMode: chatFields.gameMode?.value || "",
  };
}

function setChatField(key, value) {
  const field = chatFields[key];

  if (field && value !== null && value !== undefined) {
    field.value = value;
  }
}

function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem("moodanswerChatSettings") || "{}");
  } catch {
    return {};
  }
}

function saveActiveSettings(question = "") {
  const settings = getSettings();
  localStorage.setItem(
    "moodanswerChatSettings",
    JSON.stringify({
      ...settings,
      question,
      humorMode: String(settings.humorMode),
      supportiveLine: String(settings.supportiveLine),
      studyMode: String(settings.studyMode),
      focusMode: String(settings.focusMode),
      assistantMode: settings.assistantMode,
      roomName: settings.roomName,
      gameMode: settings.gameMode,
    }),
  );
}

function isFunTalkMode() {
  return getSettings().assistantMode === "funtalk";
}

function isRoomsMode() {
  return getSettings().assistantMode === "rooms";
}

function isFunGamesMode() {
  return getSettings().assistantMode === "fungames";
}

function getRoomName() {
  return getSettings().roomName || "Chill Cafe";
}

function getRoomProfile() {
  return window.MoodAnswerRooms?.get(getRoomName()) || roomProfiles[getRoomName()] || {
    title: "Chill Cafe",
    hero: "Peaceful casual talk with a cozy internet cafe vibe.",
    placeholder: "Start a chill conversation...",
  };
}

function getGameName() {
  return getSettings().gameMode || "Quiz Challenge";
}

function getGameProfile() {
  return window.MoodAnswerGames?.get(getGameName()) || gameProfiles[getGameName()] || {
    title: "Quiz Challenge",
    hero: "Quick quiz rounds with score, streaks, and levels.",
    placeholder: "Choose a category or type next question...",
  };
}

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function uniqueMessages(messages) {
  return [...new Set(messages.filter(Boolean))];
}

function getTypingMessages(settings = getSettings()) {
  const moodProfile = moodTypingProfiles[settings.mood] || moodTypingProfiles.normal;
  const baseMessages = [
    "Thinking...",
    "Analyzing...",
    "Writing answer...",
    "Generating response...",
    "Almost done...",
  ];

  if (voiceChatMode?.checked) {
    baseMessages.unshift("🧠 Understanding...", "✍ Generating reply...");
  }

  if (settings.assistantMode === "funtalk") {
    return uniqueMessages([
      "Thinking of something fun 😭",
      "Cooking a joke 😂",
      "Preparing chaos 💀",
      "Almost ready...",
    ]);
  }

  if (settings.assistantMode === "fungames") {
    return uniqueMessages([
      "Preparing next round...",
      "Balancing the fun...",
      "Setting up the challenge...",
      "Almost ready...",
    ]);
  }

  if (settings.assistantMode === "rooms") {
    if (settings.roomName === "Coding Help") {
      return uniqueMessages([
        "Checking code...",
        "Analyzing error...",
        "Building solution...",
        "Almost done...",
      ]);
    }

    if (settings.roomName === "Study Room") {
      return uniqueMessages([
        "Creating notes...",
        "Preparing examples...",
        "Simplifying concepts...",
        "Almost ready...",
      ]);
    }

    if (settings.roomName === "Late Night Talk") {
      return uniqueMessages([
        "Late-night thoughts loading 🌙",
        "Brewing a cozy reply ☕",
        "Writing softly...",
        "Almost ready...",
      ]);
    }
  }

  return uniqueMessages([
    ...moodProfile.messages,
    "Searching for the best explanation...",
    "Finding an example...",
    ...baseMessages,
  ]);
}

function getTypingSpeed(settings = getSettings()) {
  const moodProfile = moodTypingProfiles[settings.mood] || moodTypingProfiles.normal;
  const lengthFactor = {
    Short: 0.75,
    Medium: 1,
    Detailed: 1.34,
  }[settings.answerLength] || 1;
  const studyFactor = settings.studyMode ? 1.12 : 1;
  const focusFactor = settings.focusMode ? 0.78 : 1;
  const modeFactor =
    settings.assistantMode === "rooms" && settings.roomName === "Coding Help"
      ? 1.1
      : settings.assistantMode === "rooms" && settings.roomName === "Study Room"
        ? 1.16
        : settings.assistantMode === "funtalk"
          ? 0.86
          : 1;
  const voiceFactor = voiceChatMode?.checked ? 0.92 : 1;
  const factor = moodProfile.speed * lengthFactor * studyFactor * focusFactor * modeFactor * voiceFactor;
  const intervalMs = Math.min(Math.max(Math.round(950 * factor), 560), 1750);

  return {
    intervalMs,
    minimumMs: Math.min(Math.max(Math.round(720 * factor), 460), 1450),
    label: moodProfile.label,
  };
}

function startTypingAnimation(bubble, settings = getSettings()) {
  const messages = getTypingMessages(settings);
  const speed = getTypingSpeed(settings);
  const wrapper = makeElement("div", "flow-typing-wrap");
  const status = makeElement("p", "typing-status", messages[0]);
  const dots = makeElement("div", "flow-typing");
  const meta = makeElement(
    "span",
    "sr-only",
    `Typing Status: ${messages[0]}. Animation Style: pulsing dots. Speed: adaptive ${speed.label}. Mood: ${settings.mood}.`,
  );
  let messageIndex = 0;

  dots.setAttribute("aria-hidden", "true");
  dots.append(makeElement("span"), makeElement("span"), makeElement("span"));
  wrapper.append(status, dots, meta);

  bubble.classList.add("typing-bubble");
  bubble.dataset.typingMood = settings.mood;
  bubble.replaceChildren(wrapper);

  const timerId = window.setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    status.textContent = messages[messageIndex];
    meta.textContent = `Typing Status: ${messages[messageIndex]}. Animation Style: pulsing dots. Speed: adaptive ${speed.label}. Mood: ${settings.mood}.`;
    scrollToChatBottom();
  }, speed.intervalMs);

  typingTimers.set(bubble, timerId);
  return speed;
}

function stopTypingAnimation(bubble) {
  const timerId = typingTimers.get(bubble);

  if (timerId) {
    window.clearInterval(timerId);
    typingTimers.delete(bubble);
  }

  bubble.classList.remove("typing-bubble");
  delete bubble.dataset.typingMood;
}

function waitForTypingMinimum(startedAt, minimumMs) {
  const remainingMs = minimumMs - (Date.now() - startedAt);

  if (remainingMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, remainingMs);
  });
}

function getSpeechLanguage() {
  const language = getSettings().language;

  if (language === "Hindi" || language === "Hinglish") {
    return "hi-IN";
  }

  return "en-IN";
}

function setReadVoiceStatus(message) {
  if (flowVoiceStatus) {
    flowVoiceStatus.textContent = message;
  }
}

function setReadButtonState(button, isSpeaking) {
  if (!button) {
    return;
  }

  button.classList.toggle("speaking", isSpeaking);
  button.setAttribute("aria-label", isSpeaking ? "Stop voice" : "Read answer aloud");
  button.title = isSpeaking ? "Stop voice" : "Read answer aloud";

  const text = button.querySelector("span");

  if (text) {
    text.textContent = isSpeaking ? "Stop" : "Listen";
  }
}

function stopReadAloud() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (activeSpeechButton) {
    setReadButtonState(activeSpeechButton, false);
    activeSpeechButton = null;
  }
}

function readAnswerAloud(text, button) {
  const cleanText = String(text || "").trim();

  if (!cleanText) {
    return;
  }

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    setReadVoiceStatus("Voice playback is not supported in this browser.");
    return;
  }

  if (activeSpeechButton === button && window.speechSynthesis.speaking) {
    stopReadAloud();
    setReadVoiceStatus("Voice stopped.");
    return;
  }

  stopReadAloud();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const speechButton = button || null;
  utterance.lang = getSpeechLanguage();
  utterance.rate = 0.95;
  utterance.pitch = 1;

  activeSpeechButton = speechButton;
  setReadButtonState(activeSpeechButton, true);
  setReadVoiceStatus("🔊 Speaking...");

  utterance.addEventListener("end", () => {
    if (activeSpeechButton === speechButton) {
      setReadButtonState(activeSpeechButton, false);
      activeSpeechButton = null;
      setReadVoiceStatus("");
    }
  });

  utterance.addEventListener("error", () => {
    if (activeSpeechButton === speechButton) {
      setReadButtonState(activeSpeechButton, false);
      activeSpeechButton = null;
      setReadVoiceStatus("Voice playback could not start. Please try again.");
    }
  });

  window.speechSynthesis.speak(utterance);
}

function makeSpeakerIcon() {
  return `
    <svg class="voice-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M16 9a5 5 0 0 1 0 6" />
      <path d="M19 6a9 9 0 0 1 0 12" />
    </svg>
  `;
}

function appendReadAloudControl(bubble, speakableText) {
  const cleanText = String(speakableText || "").trim();

  if (!cleanText) {
    return null;
  }

  const controls = makeElement("div", "flow-voice-controls");
  const button = makeElement("button", "read-aloud-button");
  button.type = "button";
  button.setAttribute("aria-label", "Read answer aloud");
  button.title = "Read answer aloud";
  button.innerHTML = `${makeSpeakerIcon()}<span>Listen</span>`;
  button.addEventListener("click", () => readAnswerAloud(cleanText, button));

  controls.append(button);
  bubble.append(controls);
  return button;
}

function resizeQuestionInput() {
  if (!chatQuestion) {
    return;
  }

  chatQuestion.style.height = "auto";
  chatQuestion.style.height = `${Math.min(chatQuestion.scrollHeight, 150)}px`;
}

function scrollToChatBottom() {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  });
}

function openChatArea() {
  if (flowHero) {
    flowHero.hidden = true;
  }

  if (flowChat) {
    flowChat.hidden = false;
  }

  if (chatQuestion) {
    if (isRoomsMode()) {
      chatQuestion.placeholder = "Continue in this room...";
    } else if (isFunGamesMode()) {
      chatQuestion.placeholder = "Answer the round or type next...";
    } else {
      chatQuestion.placeholder = isFunTalkMode()
        ? "Say anything fun..."
        : "Ask another question...";
    }
  }
}

function getAiSpeakerName() {
  if (isRoomsMode()) {
    return getRoomProfile().title;
  }

  if (isFunGamesMode()) {
    return "FunGames AI";
  }

  return isFunTalkMode() ? "FunTalk AI" : "AI";
}

function createMessage(type, label) {
  const message = makeElement("article", `flow-message ${type}`);
  const speaker = makeElement("div", "flow-speaker", label);
  const bubble = makeElement("div", "flow-bubble");
  message.append(speaker, bubble);
  return { message, bubble };
}

function addUserMessage(question) {
  const { message, bubble } = createMessage("user", "User");
  bubble.append(makeElement("p", "", question));
  flowMessages.append(message);
  scrollToChatBottom();
}

function addLoadingMessage(settings = getSettings()) {
  const { message, bubble } = createMessage("ai", getAiSpeakerName());
  const speed = startTypingAnimation(bubble, settings);
  bubble.dataset.minimumTypingMs = String(speed.minimumMs);
  flowMessages.append(message);
  scrollToChatBottom();
  return bubble;
}

function appendFlowSection(bubble, label, value, labels) {
  const cleanText = cleanDisplayText(value, labels || label);

  if (!cleanText || /^none\.?$/i.test(cleanText)) {
    return "";
  }

  const section = makeElement("div", "flow-answer-section");
  section.append(makeElement("small", "", label), makeElement("p", "", cleanText));
  bubble.append(section);
  return cleanText;
}

function appendFlowActions(bubble, value) {
  const cleanText = cleanDisplayText(value, "Quick actions");

  if (!cleanText || /^none\.?$/i.test(cleanText)) {
    return;
  }

  const actions = makeElement("div", "flow-actions");
  cleanText
    .split(/[,|]/)
    .map((action) => action.trim())
    .filter(Boolean)
    .slice(0, 5)
    .forEach((action) => {
      actions.append(makeElement("span", "", action));
    });
  bubble.append(actions);
}

function setAiMessage(bubble, response) {
  stopTypingAnimation(bubble);

  const answer =
    typeof response === "string"
      ? { answer: response }
      : {
          answer: response.answer || response.body || "",
          example: response.example || "",
          lightJoke: response.lightJoke || "",
          supportiveLine: response.supportiveLine || response.moodFriendlyLine || "",
          quickActions: response.quickActions || "",
        };

  const mainAnswer = cleanDisplayText(answer.answer, "Answer");
  const speakableParts = [mainAnswer];

  bubble.replaceChildren(makeElement("p", "", mainAnswer));
  speakableParts.push(appendFlowSection(bubble, "Example", answer.example, "Example"));
  appendFlowSection(bubble, "Light joke", answer.lightJoke, "Light joke");
  speakableParts.push(
    appendFlowSection(
      bubble,
      "Supportive line",
      answer.supportiveLine,
      ["Mood-friendly line", "Supportive line"],
    ),
  );
  appendFlowActions(bubble, answer.quickActions);

  const speakableText = speakableParts.filter(Boolean).join(". ");
  const readButton = appendReadAloudControl(bubble, speakableText);

  if (voiceChatMode?.checked) {
    readAnswerAloud(speakableText, readButton);
  }

  scrollToChatBottom();
}

function createLocalAnswer(question) {
  if (isRoomsMode()) {
    return `${getRoomProfile().title} here. You said: ${question}. Let's keep this room vibe going in a safe and friendly way.`;
  }

  if (isFunTalkMode()) {
    return `FunTalk AI here. You said: ${question}. Quick fun question: if your mood had a theme song today, what would it be?`;
  }

  if (isFunGamesMode()) {
    return `${getGameProfile().title} round ready. You said: ${question}. Quick action: answer this round, ask for a hint, or type next.`;
  }

  const normalized = question.toLowerCase();
  const match = localAnswers.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return match
    ? match.answer
    : "I can format mood-aware answers here, but for live answers please open this page from localhost so the Gemini API can respond.";
}

async function createAnswer(question) {
  const settings = getSettings();

  if (window.location.protocol === "file:") {
    return createLocalAnswer(question);
  }

  const data = await MoodAnswerApi.createAnswer({
    question,
    mood: settings.mood,
    language: settings.language,
    answerLength: settings.answerLength,
    humorMode: settings.humorMode,
    supportiveLine: settings.supportiveLine,
    studyMode: settings.studyMode,
    focusMode: settings.focusMode,
    assistantMode: settings.assistantMode,
    roomName: settings.roomName,
    gameMode: settings.gameMode,
  });

  return data;
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const storedSettings = getStoredSettings();
  const routeMode =
    window.location.pathname === "/fun"
      ? "funtalk"
      : window.location.pathname === "/room-chat"
        ? "rooms"
        : window.location.pathname === "/game-chat"
          ? "fungames"
          : "";
  const hasFreshSettings = chatSettingKeys.some((key) => params.has(key));

  if (routeMode) {
    setChatField("assistantMode", routeMode);
  }

  if (routeMode === "rooms" && !params.has("roomName")) {
    setChatField("roomName", "Chill Cafe");
  }

  if (routeMode === "fungames" && !params.has("gameMode")) {
    setChatField("gameMode", "Quiz Challenge");
  }

  chatSettingKeys.forEach((key) => {
    if (routeMode && key === "assistantMode") {
      return;
    }

    if (params.has(key)) {
      setChatField(key, params.get(key));
      return;
    }

    if (!hasFreshSettings && storedSettings[key] !== undefined) {
      setChatField(key, storedSettings[key]);
    }
  });

  if (chatQuestion && params.has("question")) {
    chatQuestion.value = params.get("question");
    resizeQuestionInput();
    saveActiveSettings(chatQuestion.value);
  } else if (chatQuestion && !hasFreshSettings && storedSettings.question) {
    chatQuestion.value = storedSettings.question;
    resizeQuestionInput();
  }
}

function configureAssistantModeView() {
  if (isFunGamesMode()) {
    const profile = getGameProfile();

    if (flowKicker) {
      flowKicker.textContent = "FunGames AI";
    }

    if (flowHeroTitle) {
      flowHeroTitle.textContent = profile.title;
    }

    if (flowHeroText) {
      flowHeroText.textContent = profile.hero;
    }

    if (chatQuestion) {
      chatQuestion.placeholder = profile.placeholder;
    }

    if (newChatLink) {
      newChatLink.href = "/games";
      newChatLink.textContent = "Change game";
    }

    document.title = `${profile.title} | FunGames AI`;
    return;
  }

  if (isRoomsMode()) {
    const profile = getRoomProfile();

    if (flowKicker) {
      flowKicker.textContent = "Adaptive AI Rooms";
    }

    if (flowHeroTitle) {
      flowHeroTitle.textContent = profile.title;
    }

    if (flowHeroText) {
      flowHeroText.textContent = profile.hero;
    }

    if (chatQuestion) {
      chatQuestion.placeholder = profile.placeholder;
    }

    if (newChatLink) {
      newChatLink.href = "/rooms";
      newChatLink.textContent = "Change room";
    }

    document.title = `${profile.title} | MoodAnswer AI`;
    return;
  }

  if (!isFunTalkMode()) {
    if (flowKicker) {
      flowKicker.textContent = "MoodAnswer AI";
    }

    if (flowHeroTitle) {
      flowHeroTitle.textContent = "Ask anything. Get mood-aware answer.";
    }

    if (flowHeroText) {
      flowHeroText.textContent =
        "Type or speak a question, then get a helpful answer in the selected tone.";
    }

    if (chatQuestion) {
      chatQuestion.placeholder = "Ask your question...";
    }

    if (newChatLink) {
      newChatLink.href = "/ask";
      newChatLink.textContent = "New chat";
    }

    document.title = "Chat | MoodAnswer AI";
    return;
  }

  if (flowKicker) {
    flowKicker.textContent = "FunTalk AI";
  }

  if (flowHeroTitle) {
    flowHeroTitle.textContent = "Feeling bored? Start a fun safe chat.";
  }

  if (flowHeroText) {
    flowHeroText.textContent =
      "Jokes, memes, random questions, light roasts, mini-games, cozy talk, and playful replies inside MoodAnswer AI.";
  }

  if (chatQuestion) {
    chatQuestion.placeholder = "Say hi, ask for a joke, or type 'I'm bored'...";
  }

  if (newChatLink) {
    newChatLink.href = "/fun?assistantMode=funtalk";
    newChatLink.textContent = "New chat";
  }

  document.title = "FunTalk AI | MoodAnswer AI";
}

function applyLocalLinks() {
  if (window.location.protocol !== "file:") {
    return;
  }

  if (newChatLink) {
    newChatLink.href = "ask.html";
  }
}

function loadVoiceChatPreference() {
  if (voiceChatMode) {
    voiceChatMode.checked = localStorage.getItem(voiceChatStorageKey) === "true";
  }
}

async function loadSession() {
  if (window.location.protocol === "file:") {
    return;
  }

  const data = await MoodAnswerApi.getSession();

  if (!data.authenticated) {
    window.location.href = "/login";
    return;
  }

  if (sessionUser) {
    sessionUser.textContent = data.displayName || data.username || "User";
  }
}

if (chatQuestion) {
  chatQuestion.addEventListener("input", resizeQuestionInput);
  chatQuestion.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatForm?.requestSubmit();
    }
  });
}

if (chatForm) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = String(chatQuestion?.value || "").trim();

    if (!question) {
      chatQuestion?.focus();
      return;
    }

    openChatArea();
    stopReadAloud();
    const activeSettings = getSettings();
    saveActiveSettings(question);
    addUserMessage(question);
    const loadingStartedAt = Date.now();
    const loadingBubble = addLoadingMessage(activeSettings);
    const minimumTypingMs = Number(loadingBubble.dataset.minimumTypingMs || 0);

    if (chatQuestion) {
      chatQuestion.value = "";
      resizeQuestionInput();
    }

    chatSubmit.disabled = true;
    chatSubmit.textContent = "Thinking";

    try {
      const answer = await createAnswer(question);
      await waitForTypingMinimum(loadingStartedAt, minimumTypingMs);
      setAiMessage(loadingBubble, answer);
      window.MoodAnswerStreaks?.recordActivity(isFunGamesMode() ? "game" : "question");
    } catch (error) {
      await waitForTypingMinimum(loadingStartedAt, minimumTypingMs);
      setAiMessage(loadingBubble, error.message);
    } finally {
      chatSubmit.disabled = false;
      chatSubmit.textContent = "Send";
      chatQuestion?.focus();
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await MoodAnswerApi.logout();
    window.location.href = "/login";
  });
}

if (newChatLink) {
  newChatLink.addEventListener("click", () => {
    localStorage.removeItem("moodanswerChatSettings");
    stopReadAloud();
    window.MoodAnswerSound?.stop();
  });
}

if (voiceChatMode) {
  voiceChatMode.addEventListener("change", () => {
    localStorage.setItem(voiceChatStorageKey, String(voiceChatMode.checked));

    if (voiceChatMode.checked) {
      setReadVoiceStatus("Voice chat is on. New answers will be read aloud.");
      return;
    }

    stopReadAloud();
    setReadVoiceStatus("");
  });
}

applyQueryParams();
applyLocalLinks();
configureAssistantModeView();
window.MoodAnswerTheme?.apply(getSettings());
window.MoodAnswerSound?.init(getSettings());
loadVoiceChatPreference();
resizeQuestionInput();
loadSession();
