const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioUnlocked = false;
let audioEnabled = true;

let currentSongSpeed = 0.4;
let songPlaying = false;
let activeNotes = [];
let currentSongMode = null;

let lastFootstepTime = 0;
const footstepInterval = 250;
const footstepVolume = 0.22;


const audioBtn = document.getElementById("audio-toggle");

function unlockAudio() {
  if (!audioUnlocked) {
    audioCtx.resume().then(() => {
      audioUnlocked = true;
      console.log("Audio unlocked!");
    });
  }
}

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

function startFootsteps() {
  if (!audioUnlocked || !audioEnabled) return;

  const now = performance.now();
  if (now - lastFootstepTime < footstepInterval) return; // enforce delay

  lastFootstepTime = now;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 300 + Math.random() * 50;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(footstepVolume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.08);
}

function updateSongMode(mode) {
  if (currentSongMode === mode) return;
  currentSongMode = mode;

  stopSong();
  
  if (mode === "normal") playSongLoop(melody, 0.9);
  else if (mode === "fish") playSongLoop(melody, 0.2);
}

const melody = [
  { freq: 523}, // C5
  { freq: 493}, // B
  { freq: 523}, // C5
  { freq: 493}, // B
  { freq: 523}, // C5
  { freq: 493}, // B
  { freq: 392}, // G4
  { freq: 415}, // Ab4
];

function playNote(freq, duration, startTime) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = freq;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0.2, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// function playSong(melody) {
//   let now = audioCtx.currentTime;
//   for (const note of melody) {
//     playNote(note.freq, note.duration, now);
//     now += note.duration * 1.1; 
//   }
// }

function playSongLoop(melody, speed = currentSongSpeed, loop = true) {
  if (!audioUnlocked || !audioEnabled) return;

  stopSong();

  songPlaying = true;
  currentSongSpeed = speed;
  let now = audioCtx.currentTime;

  melody.forEach(note => {
    if (!songPlaying) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.value = note.freq;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + speed);

    osc.start(now);
    osc.stop(now + speed);
    activeNotes.push(osc);

    now += speed * 1.1;
  });

  if (loop) {
    const totalDuration = melody.reduce((sum) => sum + speed * 1.1, 0);
    setTimeout(() => {
      if (songPlaying) playSongLoop(melody, currentSongSpeed, loop);
    }, totalDuration * 1000);
  }
}
function stopSong() {
  songPlaying = false;
  activeNotes.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });

  activeNotes = [];
}
window.addEventListener("keydown", unlockAudio, { once: true });
window.addEventListener("mousedown", unlockAudio, { once: true });
