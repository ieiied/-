import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Volume2,
  Sliders,
  Music2,
  Disc3,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import {
  NOTE_FREQUENCIES,
  NOTE_SOLFEGE,
  CHORD_DEFINITIONS,
  playPianoNote,
  playChord,
  playKick,
  playSnare,
  playHiHatClosed,
  playClap,
  DRUM_PRESETS,
  type DrumPattern,
  getAudioContext
} from '../utils/audioEngine';

interface KeyConfig {
  note: string;
  isBlack: boolean;
  keyboardKey: string;
  solfege: string;
}

export const InteractiveStudioTab: React.FC = () => {
  // --- Piano State ---
  const [octaveOffset, setOctaveOffset] = useState<number>(0); // -1, 0, +1
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [showSolfege, setShowSolfege] = useState<boolean>(true);
  const [lastPlayedChord, setLastPlayedChord] = useState<string | null>(null);

  // --- Drum Sequencer State ---
  const [bpm, setBpm] = useState<number>(105);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [grid, setGrid] = useState<{
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    clap: boolean[];
  }>(DRUM_PRESETS[0].grid);

  const stepRef = useRef<number>(-1);
  const timerRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Keys layout for 1 octave + next C (C4 to C5 default)
  const baseOctave = 4 + octaveOffset;
  const pianoKeys: KeyConfig[] = [
    { note: `C${baseOctave}`, isBlack: false, keyboardKey: 'A', solfege: '도' },
    { note: `C#${baseOctave}`, isBlack: true, keyboardKey: 'W', solfege: '도#' },
    { note: `D${baseOctave}`, isBlack: false, keyboardKey: 'S', solfege: '레' },
    { note: `D#${baseOctave}`, isBlack: true, keyboardKey: 'E', solfege: '레#' },
    { note: `E${baseOctave}`, isBlack: false, keyboardKey: 'D', solfege: '미' },
    { note: `F${baseOctave}`, isBlack: false, keyboardKey: 'F', solfege: '파' },
    { note: `F#${baseOctave}`, isBlack: true, keyboardKey: 'T', solfege: '파#' },
    { note: `G${baseOctave}`, isBlack: false, keyboardKey: 'G', solfege: '솔' },
    { note: `G#${baseOctave}`, isBlack: true, keyboardKey: 'Y', solfege: '솔#' },
    { note: `A${baseOctave}`, isBlack: false, keyboardKey: 'H', solfege: '라' },
    { note: `A#${baseOctave}`, isBlack: true, keyboardKey: 'U', solfege: '라#' },
    { note: `B${baseOctave}`, isBlack: false, keyboardKey: 'J', solfege: '시' },
    { note: `C${baseOctave + 1}`, isBlack: false, keyboardKey: 'K', solfege: '도(높음)' },
    { note: `C#${baseOctave + 1}`, isBlack: true, keyboardKey: 'O', solfege: '도#' },
    { note: `D${baseOctave + 1}`, isBlack: false, keyboardKey: 'L', solfege: '레' },
  ];

  const handlePlayKey = useCallback((note: string) => {
    getAudioContext();
    const freq = NOTE_FREQUENCIES[note];
    if (freq) {
      playPianoNote(freq, 0.9);
      setActiveNotes(prev => new Set(prev).add(note));
      setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }, 250);
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const upper = e.key.toUpperCase();
      const matched = pianoKeys.find(k => k.keyboardKey === upper);
      if (matched && !e.repeat) {
        handlePlayKey(matched.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pianoKeys, handlePlayKey]);

  // --- Drum Sequencer Engine Loop ---
  const stopSequencer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    stepRef.current = -1;
    setCurrentStep(-1);
  }, []);

  const triggerStepSounds = useCallback((step: number) => {
    const g = gridRef.current;
    if (g.kick[step]) playKick();
    if (g.snare[step]) playSnare();
    if (g.hihat[step]) playHiHatClosed();
    if (g.clap[step]) playClap();
  }, []);

  const startSequencer = useCallback(() => {
    getAudioContext();
    stopSequencer();

    isPlayingRef.current = true;
    setIsPlaying(true);

    // 16th note interval = (60 / BPM) / 4 seconds = (15000 / BPM) ms
    const intervalMs = (60000 / bpmRef.current) / 4;

    stepRef.current = 0;
    setCurrentStep(0);
    triggerStepSounds(0);

    timerRef.current = window.setInterval(() => {
      if (!isPlayingRef.current) return;
      stepRef.current = (stepRef.current + 1) % 16;
      setCurrentStep(stepRef.current);
      triggerStepSounds(stepRef.current);
    }, intervalMs);
  }, [stopSequencer, triggerStepSounds]);

  // Restart loop smoothly if BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      startSequencer();
    }
  }, [bpm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleDrumCell = (track: 'kick' | 'snare' | 'hihat' | 'clap', stepIdx: number) => {
    getAudioContext();
    setGrid(prev => {
      const nextTrack = [...prev[track]];
      nextTrack[stepIdx] = !nextTrack[stepIdx];
      // Preview sound when toggling on
      if (nextTrack[stepIdx]) {
        if (track === 'kick') playKick();
        if (track === 'snare') playSnare();
        if (track === 'hihat') playHiHatClosed();
        if (track === 'clap') playClap();
      }
      return { ...prev, [track]: nextTrack };
    });
  };

  const handleApplyPreset = (preset: DrumPattern) => {
    setBpm(preset.bpm);
    setGrid(preset.grid);
  };

  const handleClearGrid = () => {
    setGrid({
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      clap: Array(16).fill(false),
    });
  };

  const handlePlayChordPreset = (chordKey: string) => {
    getAudioContext();
    playChord(chordKey, 1.4);
    setLastPlayedChord(chordKey);
    setTimeout(() => setLastPlayedChord(null), 1200);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold border border-pink-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>직접 연주하고 비트를 찍어보는</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          인터랙티브 <span className="text-pink-600 font-extrabold">감정 표현 창작 스튜디오</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          가상 피아노 건반을 누르거나 컴퓨터 키보드로 멜로디를 치고, 16스텝 비트 시뮬레이터로 나만의 8비트 드럼을 작곡해 보세요!
        </p>
      </div>

      {/* 1. VIRTUAL PIANO SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">가상 웹 피아노 (Synthesizer Piano)</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                마우스 클릭이나 키보드 키(A, S, D, F...)로 실시간 연주할 수 있어요.
              </p>
            </div>
          </div>

          {/* Controls: Octave & Solfege Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSolfege(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                showSolfege
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {showSolfege ? '도레미 계이름 표시 켜짐' : '영어 음이름만 표시'}
            </button>

            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-bold text-slate-600">
              <button
                disabled={octaveOffset <= -1}
                onClick={() => setOctaveOffset(prev => prev - 1)}
                className="px-2.5 py-1 rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
                title="한 옥타브 낮추기"
              >
                -1 옥타브
              </button>
              <span className="px-2 text-pink-600">
                {octaveOffset === 0 ? '기본 (4옥)' : `${baseOctave}옥타브`}
              </span>
              <button
                disabled={octaveOffset >= 1}
                onClick={() => setOctaveOffset(prev => prev + 1)}
                className="px-2.5 py-1 rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
                title="한 옥타브 높이기"
              >
                +1 옥타브
              </button>
            </div>
          </div>
        </div>

        {/* Quick Chord Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>원클릭 삼화음(Chord) 연주해보기</span>
            </span>
            <span className="text-xs text-pink-500 font-medium">클릭 시 3음이 함께 울려요</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.entries(CHORD_DEFINITIONS).map(([key, info]) => {
              const isTriggered = lastPlayedChord === key;
              return (
                <button
                  key={key}
                  onClick={() => handlePlayChordPreset(key)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer transform active:scale-95 ${
                    isTriggered
                      ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white border-pink-400 shadow-md scale-105'
                      : 'bg-amber-50/60 border-amber-200/70 hover:bg-amber-100 text-slate-800'
                  }`}
                >
                  <div className="text-base font-extrabold">{key}</div>
                  <div className={`text-[11px] truncate ${isTriggered ? 'text-white/90' : 'text-slate-500'}`}>
                    {info.nameKo}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIANO KEYBOARD COMPONENT */}
        <div className="p-4 bg-slate-900 rounded-3xl shadow-inner overflow-x-auto">
          <div className="relative flex justify-center min-w-[580px] h-48 select-none py-2">
            {pianoKeys.map((k) => {
              const isPressed = activeNotes.has(k.note);

              if (k.isBlack) {
                return (
                  <button
                    key={k.note}
                    onMouseDown={() => handlePlayKey(k.note)}
                    className={`absolute z-20 w-8 sm:w-10 h-28 rounded-b-xl shadow-lg transition-transform cursor-pointer border-x border-b border-black ${
                      isPressed
                        ? 'bg-pink-600 scale-95 shadow-pink-500/50'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{
                      // Place black keys over the boundary of corresponding white keys
                      left: getBlackKeyLeftPosition(k.keyboardKey),
                    }}
                  >
                    <div className="absolute bottom-2 inset-x-0 text-center text-white text-[10px] font-mono opacity-80">
                      {k.keyboardKey}
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={k.note}
                  onMouseDown={() => handlePlayKey(k.note)}
                  className={`relative z-10 w-12 sm:w-14 h-44 rounded-b-2xl border border-slate-300 mx-0.5 flex flex-col justify-end items-center pb-3 shadow-md transition-all cursor-pointer ${
                    isPressed
                      ? 'bg-amber-100 shadow-inner scale-[0.98]'
                      : 'bg-white hover:bg-amber-50/60'
                  }`}
                >
                  <div className="text-center space-y-0.5">
                    {showSolfege && (
                      <div className="text-xs font-extrabold text-pink-600">
                        {k.solfege}
                      </div>
                    )}
                    <div className="text-[11px] font-bold text-slate-700">
                      {k.note}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1">
                      {k.keyboardKey}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. 8-BEAT / 16-STEP DRUM SIMULATOR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pink-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
              <Disc3 className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">8비트 드럼 비트 시뮬레이터 (16-Step Drum Machine)</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                격자를 클릭해 비트를 만들고 [재생]을 누르면 실시간 사운드가 연주됩니다!
              </p>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-3">
            {isPlaying ? (
              <button
                onClick={stopSequencer}
                className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>정지</span>
              </button>
            ) : (
              <button
                onClick={startSequencer}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>비트 재생하기</span>
              </button>
            )}

            <button
              onClick={handleClearGrid}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              title="비트 전체 비우기"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BPM & Presets Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {/* BPM Slider */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 min-w-[70px]">
              <Sliders className="w-4 h-4 text-pink-500" />
              <span>템포 (BPM)</span>
            </div>
            <input
              type="range"
              min="70"
              max="150"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="flex-1 accent-pink-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-pink-600 text-sm min-w-[50px] text-right">
              {bpm} BPM
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 flex-shrink-0">장르 프리셋:</span>
            {DRUM_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-pink-300 text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-pink-50/50"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Sequencer Grid */}
        <div className="space-y-3 overflow-x-auto pb-2">
          {/* Track Rows */}
          {(
            [
              { id: 'hihat', name: '하이햇 (Hi-Hat)', sound: playHiHatClosed, color: 'bg-amber-400', activeBorder: 'border-amber-400', soundHint: '칫칫' },
              { id: 'clap', name: '클랩/오픈 (Clap)', sound: playClap, color: 'bg-purple-400', activeBorder: 'border-purple-400', soundHint: '짝!' },
              { id: 'snare', name: '스네어 (Snare)', sound: playSnare, color: 'bg-rose-400', activeBorder: 'border-rose-400', soundHint: '딱!' },
              { id: 'kick', name: '킥 드럼 (Kick)', sound: playKick, color: 'bg-pink-500', activeBorder: 'border-pink-500', soundHint: '쿵!' },
            ] as const
          ).map((track) => (
            <div key={track.id} className="flex items-center gap-2 min-w-[640px]">
              {/* Track Title and Direct Audition Button */}
              <button
                onClick={() => {
                  getAudioContext();
                  track.sound();
                }}
                className="w-36 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{track.name}</div>
                  <div className="text-[10px] text-slate-500">{track.soundHint}</div>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* 16 Step Buttons */}
              <div className="flex-1 grid grid-cols-16 gap-1 sm:gap-1.5">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const isActive = grid[track.id][stepIdx];
                  const isCurrentBeat = currentStep === stepIdx;
                  const isDownBeat = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleDrumCell(track.id, stepIdx)}
                      className={`h-11 sm:h-12 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                        isActive
                          ? `${track.color} text-white shadow-xs font-bold`
                          : isDownBeat
                          ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      } ${
                        isCurrentBeat
                          ? 'ring-2 ring-pink-500 scale-105 z-10'
                          : ''
                      }`}
                    >
                      {isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Step Numbers & Measure Indicators */}
          <div className="flex items-center gap-2 min-w-[640px] pt-1">
            <div className="w-36 text-[11px] font-bold text-slate-400 text-right pr-2">
              박자 (16분음표)
            </div>
            <div className="flex-1 grid grid-cols-16 gap-1 sm:gap-1.5 text-center">
              {Array.from({ length: 16 }).map((_, stepIdx) => {
                const isDownBeat = stepIdx % 4 === 0;
                const isCurrent = currentStep === stepIdx;
                return (
                  <div
                    key={stepIdx}
                    className={`text-[10px] font-mono py-1 rounded-md transition-colors ${
                      isCurrent
                        ? 'bg-pink-500 text-white font-bold'
                        : isDownBeat
                        ? 'font-bold text-slate-700 bg-amber-100/50'
                        : 'text-slate-400'
                    }`}
                  >
                    {stepIdx + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>비트 만들기 추천 법칙: </strong>
            스네어(Snare)를 <strong>5번과 13번 스텝(2박과 4박 백비트)</strong>에 켜두고, 킥(Kick)을 1번과 11번에 켜면 듣기 편안한 8비트 기본 리듬이 만들어집니다!
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for positioning black keys accurately over white keys in piano UI
function getBlackKeyLeftPosition(key: string): string {
  switch (key) {
    case 'W': return '35px'; // C#4
    case 'E': return '85px'; // D#4
    case 'T': return '185px'; // F#4
    case 'Y': return '235px'; // G#4
    case 'U': return '285px'; // A#4
    case 'O': return '385px'; // C#5
    default: return '0px';
  }
}
