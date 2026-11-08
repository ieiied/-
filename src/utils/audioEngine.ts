/**
 * Web Audio API based Sound Engine for Piano and Drum Sequencer
 * Zero latency, zero external assets, 100% reliable across modern browsers and mobile.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Note frequencies in Hz (Octaves 3, 4, 5)
export const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
};

// Korean Solfège names
export const NOTE_SOLFEGE: Record<string, string> = {
  'C': '도', 'C#': '도#', 'D': '레', 'D#': '레#', 'E': '미', 'F': '파', 'F#': '파#', 'G': '솔', 'G#': '솔#', 'A': '라', 'A#': '라#', 'B': '시'
};

// Common Triad Chords for Music Theory Tab
export const CHORD_DEFINITIONS: Record<string, { notes: string[]; nameKo: string; mood: string }> = {
  'C': { notes: ['C4', 'E4', 'G4'], nameKo: 'C 메이저', mood: '밝고 맑은 느낌 (기본 으뜸화음)' },
  'Dm': { notes: ['D4', 'F4', 'A4'], nameKo: 'D 마이너', mood: '차분하고 감성적인 느낌' },
  'Em': { notes: ['E4', 'G4', 'B4'], nameKo: 'E 마이너', mood: '신비롭고 약간 쓸쓸한 느낌' },
  'F': { notes: ['F4', 'A4', 'C5'], nameKo: 'F 메이저', mood: '따뜻하고 포근한 느낌' },
  'G': { notes: ['G4', 'B4', 'D5'], nameKo: 'G 메이저', mood: '에너지 넘치고 해결되는 느낌' },
  'Am': { notes: ['A4', 'C5', 'E5'], nameKo: 'A 마이너', mood: '슬프고 감미로운 느낌 (서정적)' },
};

/**
 * Rich Polyphonic Piano Synthesizer Voice
 */
export function playPianoNote(freq: number, duration: number = 0.8, volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master gain for this note
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Warm Low-pass Filter with subtle resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + duration);
    filter.Q.value = 1.8;

    // Oscillator 1: Fundamental Triangle Wave (Warm body)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    // Oscillator 2: Overtone Sine Wave slightly detuned (Richness)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.002, now);

    // Oscillator 3: Sub Sine for deep bottom end
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq, now);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.4;

    const osc3Gain = ctx.createGain();
    osc3Gain.gain.value = 0.5;

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  } catch (err) {
    console.error('Audio play error:', err);
  }
}

/**
 * Play a Triad Chord simultaneously
 */
export function playChord(chordKey: string, duration: number = 1.2) {
  const chord = CHORD_DEFINITIONS[chordKey];
  if (!chord) return;

  chord.notes.forEach((noteName, idx) => {
    const freq = NOTE_FREQUENCIES[noteName];
    if (freq) {
      setTimeout(() => {
        playPianoNote(freq, duration, 0.22);
      }, idx * 15); // gentle strumming effect
    }
  });
}

/**
 * Synthesizer Drum Voices
 */

// 1. Kick Drum (Deep punchy 808/acoustic style)
export function playKick(time?: number) {
  const ctx = getAudioContext();
  const t = time ?? ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

  gain.gain.setValueAtTime(0.7, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.35);
}

// 2. Snare Drum (Crisp snappy snare with noise burst + tone body)
export function playSnare(time?: number) {
  const ctx = getAudioContext();
  const t = time ?? ctx.currentTime;

  // Tone body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(190, t);
  oscGain.gain.setValueAtTime(0.35, t);
  oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  // Noise burst
  const bufferSize = ctx.sampleRate * 0.2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, t);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.15);
  noise.start(t);
  noise.stop(t + 0.2);
}

// 3. Closed Hi-Hat (Sharp crisp metallic click)
export function playHiHatClosed(time?: number) {
  const ctx = getAudioContext();
  const t = time ?? ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.06;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(7500, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(t);
  noise.stop(t + 0.06);
}

// 4. Open Hi-Hat / Clap (Sustained shimmer / clap)
export function playClap(time?: number) {
  const ctx = getAudioContext();
  const t = time ?? ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, t);
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  // Multiple quick pulses for realistic clap
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(t);
  noise.stop(t + 0.25);
}

// Preset drum groove patterns for the 8-beat drum simulator
export interface DrumPattern {
  name: string;
  bpm: number;
  description: string;
  grid: {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    clap: boolean[];
  };
}

export const DRUM_PRESETS: DrumPattern[] = [
  {
    name: '기본 8비트 팝 락 (Pop Rock)',
    bpm: 105,
    description: '가장 대중적이고 친근한 8비트 드럼 비트 (쿵 칫 딱 칫)',
    grid: {
      kick:  [true,  false, false, false, false, false, true,  false, true,  false, false, false, false, false, false, false],
      snare: [false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, false],
      hihat: [true,  false, true,  false, true,  false, true,  false, true,  false, true,  false, true,  false, true,  false],
      clap:  [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    }
  },
  {
    name: '신나는 댄스/EDM 4온더플로어',
    bpm: 124,
    description: '심장을 뛰게 만드는 4박자 정박 킥과 스네어 드라이브',
    grid: {
      kick:  [true,  false, false, false, true,  false, false, false, true,  false, false, false, true,  false, false, false],
      snare: [false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, false],
      hihat: [false, false, true,  false, false, false, true,  false, false, false, true,  false, false, false, true,  false],
      clap:  [false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, false],
    }
  },
  {
    name: '칠(Chill)한 로파이 힙합',
    bpm: 85,
    description: '나른하고 감성적인 로파이 비트 (공부할 때 듣는 비트)',
    grid: {
      kick:  [true,  false, false, false, false, false, true,  false, false, false, true,  false, false, false, false, false],
      snare: [false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, true],
      hihat: [true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true],
      clap:  [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    }
  },
  {
    name: 'K-POP 아이돌 트랩 비트',
    bpm: 110,
    description: '트렌디한 롤링 하이햇과 당김음 킥 패턴',
    grid: {
      kick:  [true,  false, false, false, false, false, false, true,  false, false, true,  false, false, false, false, false],
      snare: [false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, false],
      hihat: [true,  true,  false, true,  true,  true,  false, true,  true,  true,  true,  true,  true,  false, true,  true],
      clap:  [false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, false],
    }
  }
];
