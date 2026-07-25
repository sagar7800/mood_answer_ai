const form = document.querySelector("#answerForm");
const result = document.querySelector("#result");
const resultTitle = document.querySelector("#resultTitle");
const resultBody = document.querySelector("#resultBody");
const resultExampleWrap = document.querySelector("#resultExampleWrap");
const resultExample = document.querySelector("#resultExample");
const resultJokeWrap = document.querySelector("#resultJokeWrap");
const resultJoke = document.querySelector("#resultJoke");
const resultSupportWrap = document.querySelector("#resultSupportWrap");
const resultNudge = document.querySelector("#resultNudge");
const quickActionsWrap = document.querySelector("#quickActionsWrap");
const quickActionsList = document.querySelector("#quickActionsList");
const submitButton = document.querySelector("#submitButton");
const logoutButton = document.querySelector("#logoutButton");
const sessionUser = document.querySelector("#sessionUser");
const questionInput = document.querySelector("#question");
const questionPreview = document.querySelector("#questionPreview");
const selectedMoodPill = document.querySelector("#selectedMoodPill");
const suggestionButtons = document.querySelectorAll("[data-question]");
const historyList = document.querySelector("#historyList");
const refreshHistoryButton = document.querySelector("#refreshHistoryButton");

if (document.body.classList.contains("home-body")) {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  window.addEventListener("load", () => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });
}

const moodStyles = {
  stressed: {
    title: "Answer for a stressed mood",
    transform: (answer) => shorten(answer, 2),
    support: "Take it one step at a time; this is manageable.",
    joke: "",
  },
  sad: {
    title: "Answer for a sad mood",
    transform: (answer) => `Here is the answer gently: ${answer}`,
    support: "It is okay to go slowly; you are still learning.",
    joke: "",
  },
  angry: {
    title: "Answer for an angry mood",
    transform: (answer) => answer,
    support: "Staying calm helps you choose the strongest next action.",
    joke: "",
  },
  confused: {
    title: "Answer for a confused mood",
    transform: (answer, example) =>
      `${answer} Example: ${example || "Think of it as breaking a big idea into smaller pieces."}`,
    support: "Don’t worry; you can understand it step by step.",
    joke: "Tiny example: an operating system is like a school monitor for apps, but with fewer complaints.",
  },
  curious: {
    title: "Answer for a curious mood",
    transform: (answer, example, extra) =>
      `${answer} ${extra || "A useful way to learn more is to ask what parts, purpose, and examples belong to the topic."}`,
    support: "Your curiosity is useful; keep asking clear follow-up questions.",
    joke: "Tiny joke: curiosity is basically your brain clicking the refresh button.",
  },
  tired: {
    title: "Answer for a tired mood",
    transform: (answer) => shorten(answer, 1),
    support: "That is enough for now; a short answer can still be useful.",
    joke: "",
  },
  normal: {
    title: "Clear natural answer",
    transform: (answer) => answer,
    support: "You can ask a follow-up if you want to go deeper.",
    joke: "Tiny joke: learning one concept at a time is still faster than arguing with a printer.",
  },
};

const unsafePatterns = [
  "hack",
  "steal",
  "bomb",
  "poison",
  "kill",
  "hurt someone",
  "illegal",
  "bypass password",
  "make a weapon",
];

const seriousPatterns = [
  "death",
  "die",
  "suicide",
  "self harm",
  "depression",
  "abuse",
  "violence",
  "medical",
  "doctor",
  "emergency",
  "legal",
  "lawyer",
  "loan",
  "debt",
  "investment",
  "accident",
];

const knowledgeBase = [
  {
    keywords: ["operating system", "os"],
    answer:
      "An operating system is the main software that helps a computer or phone work. It manages apps, files, memory, keyboard, screen, and other hardware. Examples include Windows, Android, iOS, macOS, and Linux.",
    example:
      "When you open an app on a phone, the operating system helps the app use the screen, storage, and internet.",
    extra:
      "Without an operating system, most users would not be able to easily run apps or control the device.",
  },
  {
    keywords: ["computer"],
    answer:
      "A computer is an electronic machine that takes input, processes data, stores information, and gives output. Laptops, desktops, tablets, and smartphones are all types of computers.",
    example:
      "Typing on a keyboard is input, the processor works on it, and the screen shows output.",
    extra:
      "The main parts are input devices, processor, memory, storage, and output devices.",
  },
  {
    keywords: ["internet"],
    answer:
      "The internet is a worldwide network that connects computers and devices so they can share information. Websites, email, video calls, and online apps use the internet.",
    example:
      "When you open a website, your device asks another computer called a server for the page.",
    extra:
      "The web is one service on the internet; the internet also supports email, messaging, and many other services.",
  },
  {
    keywords: ["ai", "artificial intelligence"],
    answer:
      "Artificial intelligence is technology that helps computers do tasks that usually need human thinking, such as answering questions, recognizing images, translating language, or finding patterns.",
    example:
      "A chatbot that answers questions is one example of AI.",
    extra:
      "AI does not truly understand like a human; it uses data and patterns to produce useful results.",
  },
  {
    keywords: ["website", "web site"],
    answer:
      "A website is a collection of web pages that people can open in a browser. It usually uses HTML for structure, CSS for design, and JavaScript for interaction.",
    example:
      "A school website may have pages for admissions, classes, contact information, and announcements.",
    extra:
      "Most websites are hosted on a server and opened through a domain name.",
  },
];

function shorten(text, sentenceLimit) {
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.slice(0, sentenceLimit).join(" ").trim() : text;
}

function isUnsafe(question) {
  const normalized = question.toLowerCase();
  return unsafePatterns.some((pattern) => normalized.includes(pattern));
}

function shouldSkipHumor(question) {
  const normalized = question.toLowerCase();
  return (
    isUnsafe(question) ||
    seriousPatterns.some((pattern) => normalized.includes(pattern))
  );
}

function findKnownAnswer(question) {
  const normalized = question.toLowerCase();
  return knowledgeBase.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );
}

function buildFallbackAnswer(question) {
  return {
    answer:
      "This prototype can format an answer by mood, but it is not connected to a live AI model yet. To answer correctly, connect it to an AI API or add this topic to the local knowledge base.",
    example:
      "For example, common topics like operating system, computer, internet, AI, and website are answered from the local knowledge base.",
    extra: `The saved question was: "${question}".`,
  };
}

function createLocalAnswer(question, mood, settings = {}) {
  const style = moodStyles[mood] || moodStyles.normal;
  const cleanQuestion = question.trim();
  const humorEnabled = settings.humorMode !== false;
  const supportEnabled = settings.supportiveLine !== false;

  if (isUnsafe(cleanQuestion)) {
    return {
      title: "Safe answer",
      body:
        "Answer: I can’t help with harmful, unsafe, or illegal instructions. I can help with a safe alternative, such as learning the law, protecting yourself online, or solving the problem in a non-harmful way.",
      lightJoke: "",
      example: "",
      quickActions: "Quick actions: Make safer, Ask for a safe alternative, Save answer",
      nudge: supportEnabled ? "Supportive line: Staying safe is the better path here." : "",
    };
  }

  const known = findKnownAnswer(cleanQuestion) || buildFallbackAnswer(cleanQuestion);
  const answer = style.transform(known.answer, known.example, known.extra);

  return {
    title: style.title,
    body: `Answer: ${answer}`,
    example: known.example ? `Example: ${known.example}` : "",
    lightJoke:
      humorEnabled && style.joke && !shouldSkipHumor(cleanQuestion)
        ? `Light joke: ${style.joke}`
        : "",
    quickActions:
      "Quick actions: Make simpler, Make detailed, Short answer, Explain with example, Save answer",
    nudge: supportEnabled ? `Supportive line: ${style.support}` : "",
  };
}

async function createAnswer(question, mood, settings = {}) {
  if (window.location.protocol === "file:") {
    return createLocalAnswer(question, mood, settings);
  }

  const data = await MoodAnswerApi.createAnswer({ question, mood, ...settings });

  return {
    title: data.title || "AI answer",
    body: data.answer,
    example: data.example || "",
    lightJoke: data.lightJoke || "",
    quickActions: data.quickActions || "",
    metadata: data.metadata || {},
    nudge: data.supportiveLine,
  };
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanDisplayText(text, labels) {
  const labelList = Array.isArray(labels) ? labels : [labels];

  return labelList
    .filter(Boolean)
    .reduce(
      (value, label) => value.replace(new RegExp(`^${escapeRegex(label)}:\\s*`, "i"), ""),
      String(text || "").trim(),
    )
    .trim();
}

function getSelectedMoodLabel() {
  if (!form) {
    return "Normal";
  }

  const checkedMood = form.querySelector("input[name='mood']:checked");
  return checkedMood
    ? checkedMood.value.charAt(0).toUpperCase() + checkedMood.value.slice(1)
    : "Normal";
}

function showOptionalText(wrap, element, text, labels) {
  if (!wrap || !element) {
    return;
  }

  const cleanText = cleanDisplayText(text, labels);

  if (!cleanText) {
    wrap.hidden = true;
    element.textContent = "";
    return;
  }

  element.textContent = cleanText;
  wrap.hidden = false;
}

function showLightJoke(text) {
  showOptionalText(resultJokeWrap, resultJoke, text, "Light joke");
}

function showQuickActions(text) {
  if (!quickActionsWrap || !quickActionsList) {
    return;
  }

  const cleanText = cleanDisplayText(text, "Quick actions");

  if (!cleanText) {
    quickActionsWrap.hidden = true;
    quickActionsList.innerHTML = "";
    return;
  }

  quickActionsList.innerHTML = cleanText
    .split(/[,|]/)
    .map((action) => action.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((action) => `<span>${escapeHtml(action)}</span>`)
    .join("");
  quickActionsWrap.hidden = false;
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

function renderHistory(items) {
  if (!historyList) {
    return;
  }

  if (!items.length) {
    historyList.innerHTML =
      '<p class="history-empty">No saved answers yet. Ask your first question above.</p>';
    return;
  }

  historyList.innerHTML = items
    .map((item) => {
      const mood = item.mood
        ? item.mood.charAt(0).toUpperCase() + item.mood.slice(1)
        : "Normal";

      return `
        <article class="history-item">
          <div class="history-item-top">
            <span class="mood-pill">Mood: ${mood}</span>
            <time>${formatHistoryDate(item.createdAt)}</time>
          </div>
          <h3>${escapeHtml(item.question || "Untitled question")}</h3>
          <p>${escapeHtml(cleanDisplayText(item.answer, "Answer"))}</p>
          <small>${escapeHtml(cleanDisplayText(item.moodFriendlyLine || item.supportiveLine, ["Mood-friendly line", "Supportive line"]))}</small>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildChatPageUrl(data) {
  const question = String(data.get("question") || "").trim();

  if (!question) {
    return "";
  }

  const chatSettings = {
    question,
    mood: String(data.get("mood") || "normal"),
    language: String(data.get("language") || "English"),
    answerLength: String(data.get("answerLength") || "Medium"),
    humorMode: data.has("humorMode") ? "true" : "false",
    supportiveLine: data.has("supportiveLine") ? "true" : "false",
    studyMode: data.has("studyMode") ? "true" : "false",
    focusMode: data.has("focusMode") ? "true" : "false",
  };

  localStorage.setItem("moodanswerChatSettings", JSON.stringify(chatSettings));

  const params = new URLSearchParams(chatSettings);
  const chatPath = window.location.protocol === "file:" ? "chat.html" : "/chat";
  return `${chatPath}?${params.toString()}`;
}

async function loadHistory() {
  if (!historyList || window.location.protocol === "file:") {
    return;
  }

  historyList.innerHTML = '<p class="history-empty">Loading history...</p>';

  try {
    const data = await MoodAnswerApi.getHistory(10);

    renderHistory(data.history || []);
  } catch (error) {
    historyList.innerHTML = `<p class="history-empty">${escapeHtml(error.message)}</p>`;
  }
}

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!questionInput) {
      return;
    }

    questionInput.value = button.dataset.question;
    questionInput.focus();
  });
});

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);

    if (form.dataset.chatRedirect === "true") {
      const chatUrl = buildChatPageUrl(data);

      if (!chatUrl) {
        questionInput?.focus();
        return;
      }

      window.location.href = chatUrl;
      return;
    }

    const question = data.get("question");
    const mood = data.get("mood");
    const settings = {
      language: data.get("language"),
      answerLength: data.get("answerLength"),
      humorMode: data.has("humorMode"),
      supportiveLine: data.has("supportiveLine"),
      studyMode: data.has("studyMode"),
      focusMode: data.has("focusMode"),
    };

    submitButton.disabled = true;
    submitButton.textContent = "Generating...";
    questionPreview.textContent = question;
    selectedMoodPill.textContent = `Mood: ${getSelectedMoodLabel()}`;

    try {
      const answer = await createAnswer(question, mood, settings);

      resultTitle.textContent = answer.title;
      resultBody.textContent = cleanDisplayText(answer.body, "Answer");
      showOptionalText(resultExampleWrap, resultExample, answer.example, "Example");
      showLightJoke(answer.lightJoke);
      showOptionalText(resultSupportWrap, resultNudge, answer.nudge, "Supportive line");
      showQuickActions(answer.quickActions);
      await loadHistory();
    } catch (error) {
      resultTitle.textContent = "Connection issue";
      resultBody.textContent = error.message;
      showOptionalText(resultExampleWrap, resultExample, "", "Example");
      showLightJoke("");
      showOptionalText(
        resultSupportWrap,
        resultNudge,
        "Supportive line: This can happen when the AI model is busy. Try again in a short moment.",
        "Supportive line",
      );
      showQuickActions("");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Generate mood-aware answer";
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
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

  await loadHistory();
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await MoodAnswerApi.logout();
    window.location.href = "/login";
  });
}

if (refreshHistoryButton) {
  refreshHistoryButton.addEventListener("click", loadHistory);
}

loadSession();
