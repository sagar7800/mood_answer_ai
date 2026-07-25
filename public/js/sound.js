const MoodAnswerSound = (() => {
  const soundRooms = {
    "Chill Cafe": {
      label: "Rain + Piano",
      status: "☕ Chill Cafe: Rain + Piano",
      mode: "rain-piano",
      file: "assets/sounds/rain-piano.wav",
      volume: 0.34,
    },
    "Late Night Talk": {
      label: "Lo-fi",
      status: "🌙 Late Night Talk: Lo-fi",
      mode: "lofi",
      file: "assets/sounds/lofi.wav",
      volume: 0.28,
    },
    "Study Room": {
      label: "Rain + Piano",
      status: "📚 Study Room: Rain + Piano",
      mode: "rain-piano",
      file: "assets/sounds/rain-piano.wav",
      volume: 0.3,
    },
  };

  const state = {
    audioContext: null,
    nodes: [],
    timers: [],
    audioElement: null,
    activeRoom: "",
    activeMode: "",
    isPlaying: false,
    statusHint: "",
  };

  function getElements() {
    return {
      panel: document.querySelector("#soundPanel"),
      toggle: document.querySelector("#soundToggle"),
      status: document.querySelector("#soundStatus"),
    };
  }

  function getAudioContext() {
    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        return null;
      }

      state.audioContext = new AudioContext();
    }

    return state.audioContext;
  }

  function createNoiseSource(context, gainValue, filterFrequency = 900) {
    const seconds = 2;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = filterFrequency;
    gain.gain.value = gainValue;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();

    state.nodes.push(source, filter, gain);
  }

  function playSoftNote(context, frequency, gainValue = 0.018, duration = 1.6) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);

    state.nodes.push(oscillator, gain);
  }

  function startRainPiano(context) {
    createNoiseSource(context, 0.035, 1400);
    const notes = [261.63, 329.63, 392, 523.25];
    let index = 0;

    state.timers.push(
      window.setInterval(() => {
        playSoftNote(context, notes[index % notes.length], 0.014, 1.8);
        index += 1;
      }, 3600),
    );
  }

  function startLofi(context) {
    createNoiseSource(context, 0.018, 620);
    const bass = context.createOscillator();
    const gain = context.createGain();

    bass.type = "triangle";
    bass.frequency.value = 82;
    gain.gain.value = 0.018;
    bass.connect(gain);
    gain.connect(context.destination);
    bass.start();
    state.nodes.push(bass, gain);

    state.timers.push(
      window.setInterval(() => {
        playSoftNote(context, 196, 0.012, 1.4);
      }, 4200),
    );
  }

  function startWhiteNoise(context) {
    createNoiseSource(context, 0.026, 1800);
  }

  function stop(options = {}) {
    state.timers.forEach((timer) => window.clearInterval(timer));
    state.timers = [];

    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement.currentTime = 0;
      state.audioElement = null;
    }

    state.nodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") {
          node.stop();
        }

        if (typeof node.disconnect === "function") {
          node.disconnect();
        }
      } catch {
        // Audio nodes can throw after already stopping; safe to ignore.
      }
    });

    state.nodes = [];
    state.isPlaying = false;

    if (!options.keepHint) {
      state.statusHint = "";
    }

    updateUi();
  }

  async function start() {
    const config = soundRooms[state.activeRoom];

    if (!config) {
      return false;
    }

    stop();
    state.activeMode = config.mode;

    if (typeof window.Audio === "function") {
      const audio = new window.Audio(config.file);
      audio.loop = true;
      audio.volume = config.volume;
      state.audioElement = audio;

      try {
        await audio.play();
        state.isPlaying = true;
        state.statusHint = "";
        updateUi();
        return true;
      } catch {
        state.audioElement = null;
        state.statusHint = "Tap again or allow audio";
        updateUi();
        return false;
      }
    }

    const context = getAudioContext();

    if (!context) {
      state.statusHint = "Audio not available here";
      updateUi();
      return false;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    if (config.mode === "rain-piano") {
      startRainPiano(context);
    } else if (config.mode === "lofi") {
      startLofi(context);
    } else {
      startWhiteNoise(context);
    }

    state.isPlaying = true;
    updateUi();
    return true;
  }

  async function toggle() {
    if (state.isPlaying) {
      stop();
      return;
    }

    await start();
  }

  function updateUi() {
    const { panel, toggle, status } = getElements();
    const config = soundRooms[state.activeRoom];

    if (!panel || !toggle || !status) {
      return;
    }

    if (!config) {
      panel.hidden = true;
      return;
    }

    panel.hidden = false;
    toggle.textContent = state.isPlaying ? "🎵 Sound On" : "🎵 Sound Off";
    toggle.setAttribute("aria-pressed", String(state.isPlaying));
    status.textContent = `${config.status} · ${
      state.statusHint || (state.isPlaying ? "Playing" : "Tap to start")
    }`;
  }

  function init(settings = {}) {
    state.activeRoom = settings.roomName || "";
    stop();
    updateUi();

    const { toggle: toggleButton } = getElements();

    if (toggleButton && !toggleButton.dataset.soundBound) {
      toggleButton.dataset.soundBound = "true";
      toggleButton.addEventListener("click", toggle);
    }
  }

  window.addEventListener("beforeunload", stop);

  return {
    init,
    stop,
    toggle,
  };
})();

window.MoodAnswerSound = MoodAnswerSound;
