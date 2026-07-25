const logoutButton = document.querySelector("#logoutButton");
const sessionUser = document.querySelector("#sessionUser");
const refreshHistoryButton = document.querySelector("#refreshHistoryButton");
const historyQuestionList = document.querySelector("#historyQuestionList");
const historyDetail = document.querySelector("#historyDetail");
const detailMood = document.querySelector("#detailMood");
const detailDate = document.querySelector("#detailDate");
const detailQuestion = document.querySelector("#detailQuestion");
const detailAnswer = document.querySelector("#detailAnswer");
const detailExampleWrap = document.querySelector("#detailExampleWrap");
const detailExample = document.querySelector("#detailExample");
const detailJokeWrap = document.querySelector("#detailJokeWrap");
const detailJoke = document.querySelector("#detailJoke");
const detailSupport = document.querySelector("#detailSupport");
const detailActionsWrap = document.querySelector("#detailActionsWrap");
const detailActions = document.querySelector("#detailActions");
const detailMetadataWrap = document.querySelector("#detailMetadataWrap");
const detailMetadata = document.querySelector("#detailMetadata");

let savedHistory = [];
let activeHistoryIndex = -1;

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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function getMoodLabel(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Normal";
}

function setActiveQuestion(index) {
  activeHistoryIndex = index;

  historyQuestionList
    .querySelectorAll(".history-question-button")
    .forEach((button) => {
      const isActive = Number(button.dataset.historyIndex) === index;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
}

function showOptionalText(wrap, element, text, labels) {
  const cleanText = cleanDisplayText(text, labels);

  if (!cleanText) {
    wrap.hidden = true;
    element.textContent = "";
    return;
  }

  element.textContent = cleanText;
  wrap.hidden = false;
}

function renderActions(wrap, element, text) {
  const cleanText = cleanDisplayText(text, "Quick actions");

  if (!cleanText) {
    wrap.hidden = true;
    element.replaceChildren();
    return;
  }

  const actionNodes = cleanText
    .split(/[,|]/)
    .map((action) => action.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((action) => {
      const chip = document.createElement("span");
      chip.textContent = action;
      return chip;
    });

  element.replaceChildren(...actionNodes);
  wrap.hidden = false;
}

function showHistoryDetail(index) {
  const item = savedHistory[index];

  if (!item) {
    return;
  }

  setActiveQuestion(index);
  detailMood.textContent = `Mood: ${getMoodLabel(item.mood)}`;
  detailDate.textContent = formatHistoryDate(item.createdAt);
  detailQuestion.textContent = item.question || "Untitled question";
  detailAnswer.textContent = cleanDisplayText(item.answer, "Answer");
  showOptionalText(detailExampleWrap, detailExample, item.example, "Example");
  showOptionalText(detailJokeWrap, detailJoke, item.lightJoke, "Light joke");
  showOptionalText(
    detailSupport.parentElement,
    detailSupport,
    item.moodFriendlyLine || item.supportiveLine,
    ["Mood-friendly line", "Supportive line"],
  );
  renderActions(detailActionsWrap, detailActions, item.quickActions);

  const metadata = item.metadata || {};
  const modeLabel =
    item.assistantMode === "rooms"
      ? `Room: ${item.roomName || metadata.roomUsed || "AI Room"}`
      : item.assistantMode === "fungames"
        ? `Game: ${item.gameMode || metadata.gameUsed || "FunGames AI"}`
      : item.assistantMode === "funtalk"
        ? "Mode: FunTalk AI"
        : "";
  const metadataText = [
    modeLabel,
    metadata.historyTitle ? `History title: ${metadata.historyTitle}` : "",
    metadata.themeTag ? `Theme: ${metadata.themeTag}` : "",
    metadata.safetyLevel ? `Safety: ${metadata.safetyLevel}` : "",
    item.language ? `Language: ${item.language}` : metadata.languageUsed ? `Language: ${metadata.languageUsed}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  showOptionalText(detailMetadataWrap, detailMetadata, metadataText, "Metadata");
  historyDetail.hidden = false;
  historyDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderQuestionList(items) {
  historyQuestionList.innerHTML = "";

  if (!items.length) {
    historyQuestionList.innerHTML =
      '<p class="history-empty">No saved questions yet. Ask something first.</p>';
    historyDetail.hidden = true;
    activeHistoryIndex = -1;
    return;
  }

  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "history-question-button";
    button.type = "button";
    button.dataset.historyIndex = String(index);
    button.setAttribute("aria-current", "false");
    button.setAttribute(
      "aria-label",
      `Open saved question: ${item.question || "Untitled question"}`,
    );
    button.innerHTML = `
      <span class="history-question-top">
        <span class="history-question-mood">Mood: ${escapeHtml(getMoodLabel(item.mood))}</span>
        <time>${escapeHtml(formatHistoryDate(item.createdAt))}</time>
      </span>
      <strong>${escapeHtml(item.question || "Untitled question")}</strong>
    `;
    button.addEventListener("click", () => showHistoryDetail(index));
    historyQuestionList.append(button);
  });

  if (activeHistoryIndex >= 0 && activeHistoryIndex < items.length) {
    setActiveQuestion(activeHistoryIndex);
  }
}

async function loadHistory() {
  historyQuestionList.innerHTML = '<p class="history-empty">Loading history...</p>';

  try {
    const data = await MoodAnswerApi.getHistory(50);

    savedHistory = data.history || [];
    activeHistoryIndex = -1;
    historyDetail.hidden = true;
    renderQuestionList(savedHistory);
  } catch (error) {
    historyQuestionList.innerHTML = `<p class="history-empty">${error.message}</p>`;
  }
}

async function loadSession() {
  const data = await MoodAnswerApi.getSession();

  if (!data.authenticated) {
    window.location.href = "/login";
    return;
  }

  sessionUser.textContent = data.displayName || data.username || "User";
  await loadHistory();
}

logoutButton.addEventListener("click", async () => {
  await MoodAnswerApi.logout();
  window.location.href = "/login";
});

refreshHistoryButton.addEventListener("click", loadHistory);

loadSession();
