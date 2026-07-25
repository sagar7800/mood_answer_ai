const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const voiceLanguageMap = {
  English: "en-IN",
  Hindi: "hi-IN",
  Hinglish: "hi-IN",
};

function getVoiceLanguage(target) {
  const form = target.closest("form");
  const languageValue =
    form?.querySelector('[name="language"]')?.value ||
    document.getElementById("chatLanguage")?.value ||
    "English";

  return voiceLanguageMap[languageValue] || "en-IN";
}

function findVoiceStatus(button) {
  const wrapper =
    button.closest(".voice-input-wrap") || button.closest(".flow-composer-inner");

  return wrapper?.querySelector("[data-voice-status]") || null;
}

function setVoiceStatus(button, message) {
  const status = findVoiceStatus(button);

  if (status) {
    status.textContent = message;
  }
}

function setVoiceButtonState(button, isListening) {
  button.disabled = isListening;
  button.classList.toggle("listening", isListening);
  button.setAttribute("aria-label", isListening ? "Listening" : "Voice search");
  button.title = isListening ? "Listening" : "Voice search";
}

document.querySelectorAll("[data-voice-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.voiceTarget);

    if (!target) {
      return;
    }

    if (!SpeechRecognition) {
      setVoiceStatus(button, "Voice search is not supported in this browser.");
      target.focus();
      return;
    }

    const recognition = new SpeechRecognition();
    let finalTranscript = "";
    let hadError = false;

    recognition.lang = button.dataset.voiceLang || getVoiceLanguage(target);
    recognition.interimResults = true;
    recognition.continuous = false;

    setVoiceButtonState(button, true);
    setVoiceStatus(button, "🎙 Listening...");

    recognition.addEventListener("result", (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript.trim();

        if (event.results[index].isFinal) {
          finalTranscript = `${finalTranscript} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      const spokenText = `${finalTranscript} ${interimTranscript}`.trim();

      if (spokenText) {
        setVoiceStatus(button, "🧠 Understanding...");
        target.value = spokenText;
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    recognition.addEventListener("error", () => {
      hadError = true;
      setVoiceStatus(button, "Could not hear clearly. Please try again.");
    });

    recognition.addEventListener("end", () => {
      setVoiceButtonState(button, false);

      if (!hadError) {
        setVoiceStatus(button, finalTranscript ? "✍ Ready to generate reply." : "");
      }

      target.focus();
    });

    try {
      recognition.start();
    } catch (error) {
      setVoiceButtonState(button, false);
      setVoiceStatus(button, "Voice search could not start. Please try again.");
      target.focus();
    }
  });
});
