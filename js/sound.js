const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioUnlocked = false;
let audioEnabled = true;

const audioBtn = document.getElementById("audio-toggle");

function unlockAudio() {
  if (!audioUnlocked) {
    audioCtx.resume().then(() => {
      audioUnlocked = true;
      console.log("Audio unlocked!");
    });
  }
}

// Audio button click
audioBtn.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  audioBtn.textContent = audioEnabled ? "🔊" : "🔇";

  if (audioEnabled) {
    unlockAudio();
  }
});

function meowSound() {
  if (!audioUnlocked || !audioEnabled) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);

  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.35);
  osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.7);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.7);
}

function playBeep(freq = 440, duration = 0.05, type = "square") {
  if (!audioUnlocked || !audioEnabled) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// Automatically unlock audio on first user interaction
window.addEventListener("keydown", unlockAudio, { once: true });
window.addEventListener("mousedown", unlockAudio, { once: true });
