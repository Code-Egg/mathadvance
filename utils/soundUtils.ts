// Simple synth sound generator using Web Audio API
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime + startTime);
  osc.stop(audioCtx.currentTime + startTime + duration);
};

export const playSound = {
  correct: () => {
    playTone(600, 'sine', 0.1);
    playTone(800, 'sine', 0.1, 0.1);
  },
  wrong: () => {
    playTone(300, 'sawtooth', 0.15);
    playTone(200, 'sawtooth', 0.3, 0.15);
  },
  click: () => {
    playTone(800, 'triangle', 0.05);
  },
  win: () => {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      playTone(freq, 'square', 0.2, i * 0.1);
    });
  }
};