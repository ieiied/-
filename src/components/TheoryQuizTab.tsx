import React, { useState } from 'react';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, Sparkles, Award, RefreshCw, Volume2, HelpCircle } from 'lucide-react';
import { playChord, playPianoNote, NOTE_FREQUENCIES } from '../utils/audioEngine';
import confetti from 'canvas-confetti';

interface TheoryQuizTabProps {
  onScoreSync: (score: number) => void;
  currentQuizScore: number | null;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '4/4 박자에서 한 마디(Measure)에 4분음표(Quarter Note)는 몇 개 들어갈까요?',
    options: ['2개', '3개', '4개', '8개'],
    correctIndex: 2,
    explanation: '4/4 박자는 "한 마디에 4분음표가 4개 들어간다"는 뜻입니다. 대중음악의 90% 이상이 4/4박자를 사용해요!',
    hint: '앞의 숫자가 한 마디에 들어가는 음표의 개수입니다.'
  },
  {
    id: 2,
    question: '피아노 건반에서 "도 - 미 - 솔" 3개 음을 함께 눌렀을 때 만들어지는 밝고 안정된 기본 화음(Chord)은 무엇일까요?',
    options: ['C Major (C 메이저)', 'Am (A 마이너)', 'F Major (F 메이저)', 'G7 (G 세븐)'],
    correctIndex: 0,
    explanation: '도(C), 미(E), 솔(G)로 이루어진 C 메이저 화음은 모든 작곡의 시작이 되는 가장 기본적이고 맑은 으뜸화음입니다.',
    hint: '으뜸음 C(도)에서 장3도(미), 완전5도(솔)를 쌓은 화음이에요.'
  },
  {
    id: 3,
    question: '대중가요나 팝송의 8비트 드럼 비트에서 스네어(Snare, "딱!") 드럼은 보통 몇 번째 박자에 연주될까요?',
    options: ['1박과 3박', '2박과 4박 (백비트)', '3박에만', '매 박자마다'],
    correctIndex: 1,
    explanation: '8비트 팝과 록 음악에서는 1, 3박에 킥(쿵), 2, 4박에 스네어(딱)가 연주되는 백비트(Backbeat)가 기본 규칙입니다.',
    hint: '손뼉을 칠 때 "하나, 둘(짝!), 셋, 넷(짝!)" 소리를 떠올려 보세요.'
  },
  {
    id: 4,
    question: '전 세계 수많은 히트곡(팝, K-POP, 애니 OST)에 공통으로 쓰이는 황금 4코드 진행(C - G - Am - F)의 별명은?',
    options: ['재즈 블루스 진행', '머니 코드 (The 4 Chords)', '불협화음 진행', '모달 인터체인지'],
    correctIndex: 1,
    explanation: 'C - G - Am - F (또는 I - V - vi - IV)는 듣기만 해도 기분이 좋아져 수많은 밀리언셀러 히트곡을 탄생시킨 "머니 코드(Money Chords)"로 불립니다!',
    hint: '듣는 순간 돈을 벌어다 줄 만큼 매력적인 진행이라는 뜻의 별명이에요.'
  },
  {
    id: 5,
    question: 'BandLab SongStarter(송스타터) AI가 만들어준 초안을 "내 감정"에 맞게 수정·편곡할 때 가장 올바른 창작 방법은?',
    options: [
      'AI가 만들어준 그대로 아무것도 손대지 않고 제출한다.',
      '내 감정과 어울리지 않는 트랙을 덜어내고(뮤트), 감성에 맞는 악기 교체 및 나만의 멜로디를 직접 얹는다.',
      '모든 악기 트랙의 볼륨을 무조건 100% 최대로 키운다.',
      'AI가 정해준 템포(BPM)와 악기를 절대로 바꾸지 않는다.'
    ],
    correctIndex: 1,
    explanation: 'AI는 훌륭한 "아이디어 도구"일 뿐입니다! 감정에 방해되는 소리를 정리하고, 내 마음에 닿는 악기로 바꾸며 나만의 멜로디를 입힐 때 비로소 진정한 내 음악이 됩니다.',
    hint: 'AI의 초안을 바탕으로 인간의 고유한 감성과 개성을 불어넣는 것이 이번 수업의 목표예요!'
  }
];

export const TheoryQuizTab: React.FC<TheoryQuizTabProps> = ({ onScoreSync, currentQuizScore }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeLesson, setActiveLesson] = useState<number>(0);

  const lessons = [
    {
      title: '1. 박자와 리듬의 비밀 🥁',
      subtitle: '4/4 박자와 8비트 리듬의 원리',
      tag: '기초 리듬',
      color: 'from-amber-400 to-orange-400',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      points: [
        { label: '4/4 박자', desc: '한 마디에 4분음표 4개가 쏙! "하나, 둘, 셋, 넷" 세는 가장 친근한 박자입니다.' },
        { label: '8비트 리듬', desc: '한 마디를 8개의 8분음표로 쪼개어 하이햇(칫칫칫칫)을 연주하는 리듬 패턴입니다.' },
        { label: 'BPM (Tempo)', desc: 'Beats Per Minute의 약자로 1분에 뛰는 비트 수! 발라드는 70~85, 댄스/팝은 115~128 BPM이 신나요.' }
      ],
      soundAction: () => {
        playPianoNote(NOTE_FREQUENCIES['C4'], 0.3);
        setTimeout(() => playPianoNote(NOTE_FREQUENCIES['E4'], 0.3), 300);
        setTimeout(() => playPianoNote(NOTE_FREQUENCIES['G4'], 0.3), 600);
        setTimeout(() => playPianoNote(NOTE_FREQUENCIES['C5'], 0.6), 900);
      },
      soundLabel: '4박자 리듬 멜로디 듣기 🎵'
    },
    {
      title: '2. 마법의 도레미 음계 🎹',
      subtitle: 'C Major Scale (다장조 음계)',
      tag: '음계 기초',
      color: 'from-pink-400 to-rose-400',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      points: [
        { label: '음계(Scale)', desc: '음악에 사용되는 음들을 순서대로 나열한 것. C Major는 "도-레-미-파-솔-라-시-도" 검은 건반 없는 흰 건반의 축제!' },
        { label: '온음과 반음', desc: '미-파(E-F), 시-도(B-C) 사이에는 검은 건반이 없어서 "반음" 거리예요. 나머지는 모두 온음입니다.' },
        { label: '으뜸음(Root)', desc: '모든 멜로디의 고향! C Major 곡은 보통 "도(C)"나 "솔(G)"에서 시작하거나 "도(C)"로 끝날 때 편안함을 줍니다.' }
      ],
      soundAction: () => {
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        notes.forEach((n, idx) => {
          setTimeout(() => playPianoNote(NOTE_FREQUENCIES[n], 0.35), idx * 220);
        });
      },
      soundLabel: '도레미파솔라시도 음계 듣기 🎶'
    },
    {
      title: '3. 삼화음과 히트 코드 🎼',
      subtitle: '화음(Triad)과 감동을 주는 코드 진행',
      tag: '코드 진행',
      color: 'from-purple-400 to-indigo-400',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      points: [
        { label: '삼화음(Triad)', desc: '근음(Root) 위에 3도씩 2개의 음을 쌓아 올린 3개 음의 조화! 예: 도-미-솔(C), 라-도-미(Am)' },
        { label: '메이저 vs 마이너', desc: '메이저 코드는 밝고 희망찬 햇살 느낌, 마이너 코드는 감성적이고 아련한 노을 느낌을 줍니다.' },
        { label: '황금 머니 코드', desc: 'C → G → Am → F 순서로 무한 반복하면 어떤 노래든 멜로디가 저절로 떠오르는 기적이 일어납니다!' }
      ],
      soundAction: () => {
        playChord('C', 1.0);
        setTimeout(() => playChord('G', 1.0), 900);
        setTimeout(() => playChord('Am', 1.0), 1800);
        setTimeout(() => playChord('F', 1.2), 2700);
      },
      soundLabel: 'C - G - Am - F 황금 진행 연주 듣기 ✨'
    },
    {
      title: '4. 쏙 꽂히는 멜로디 작곡 💡',
      subtitle: '동기(Motive) 발전과 반복의 마법',
      tag: '실전 작곡',
      color: 'from-emerald-400 to-teal-400',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      points: [
        { label: '모티브(Motive)', desc: '곡의 얼굴이 되는 1~2마디의 짧고 인상적인 리듬과 멜로디 단위입니다.' },
        { label: 'A - A\' 구조', desc: '첫 번째 문장을 연주하고, 두 번째 문장에서는 끝음만 살짝 올려 궁금증을 자아내는 기법!' },
        { label: '숨 쉴 틈(쉼표)', desc: '노래하는 사람의 호흡처럼 멜로디 중간에 반 박자~한 박자 쉼표를 두면 훨씬 세련되어집니다.' }
      ],
      soundAction: () => {
        // Simple catchy motive playback: C - E - G - E (A), then C - E - G - B (A')
        const phrase1 = [
          { n: 'C4', d: 0 }, { n: 'E4', d: 250 }, { n: 'G4', d: 500 }, { n: 'E4', d: 750 }
        ];
        const phrase2 = [
          { n: 'C4', d: 1300 }, { n: 'E4', d: 1550 }, { n: 'A4', d: 1800 }, { n: 'G4', d: 2100 }
        ];
        phrase1.forEach(p => setTimeout(() => playPianoNote(NOTE_FREQUENCIES[p.n], 0.35), p.d));
        phrase2.forEach(p => setTimeout(() => playPianoNote(NOTE_FREQUENCIES[p.n], 0.5), p.d));
      },
      soundLabel: '모티브 반복&변형 멜로디 예시 듣기 🎧'
    }
  ];

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    return Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < QUIZ_QUESTIONS.length) {
      alert(`아직 풀지 않은 문제가 있어요! (현재 ${answeredCount}/${QUIZ_QUESTIONS.length}문제 완료)`);
      return;
    }

    setIsSubmitted(true);
    const score = calculateScore();
    onScoreSync(score);

    if (score >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const score = isSubmitted ? calculateScore() : (currentQuizScore ?? 0);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold border border-pink-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>고교생을 위한 5분 음악 이론 쏙쏙</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          작곡이 쉬워지는 <span className="text-pink-600 font-extrabold">기초 음악 이론 & 퀴즈</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          어려운 화성학 용어는 빼고! 대중음악과 밴드랩(BandLab) 작업에 꼭 필요한 실전 원리만 카드뉴스로 확인하고 퀴즈를 풀어보세요.
        </p>
      </div>

      {/* 4 Lessons Interactive Carousel/Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100">
        <div className="flex flex-wrap gap-2.5 pb-6 border-b border-slate-100">
          {lessons.map((lesson, idx) => {
            const isActive = activeLesson === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveLesson(idx)}
                className={`flex-1 min-w-[140px] px-4 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-pink-400 text-white font-bold shadow-md scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                <div className="text-xs uppercase tracking-wider opacity-90">{lesson.tag}</div>
                <div className="text-sm sm:text-base font-semibold truncate">{lesson.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Lesson Content */}
        {lessons[activeLesson] && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                  {lessons[activeLesson].tag}
                </span>
                <h3 className="text-2xl font-bold text-slate-800 mt-2">{lessons[activeLesson].title}</h3>
                <p className="text-slate-500 text-sm mt-1">{lessons[activeLesson].subtitle}</p>
              </div>

              {/* Sound Preview Button */}
              <button
                onClick={lessons[activeLesson].soundAction}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-amber-500 text-white rounded-2xl font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{lessons[activeLesson].soundLabel}</span>
              </button>
            </div>

            {/* Visual Point Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {lessons[activeLesson].points.map((pt, pIdx) => (
                <div
                  key={pIdx}
                  className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/60 hover:border-amber-300 transition-colors shadow-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm mb-3">
                    0{pIdx + 1}
                  </div>
                  <h4 className="font-bold text-slate-800 text-base mb-1.5">{pt.label}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{pt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-pink-100 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 uppercase tracking-wide">
              <HelpCircle className="w-4 h-4" />
              <span>실시간 평가 퀴즈 (5문항)</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">이론 이해도 쏙쏙 퀴즈</h3>
            <p className="text-slate-500 text-sm">
              정답을 모두 고르고 [퀴즈 채점하기]를 누르면 점수가 과제 제출 탭에 자동 연동됩니다!
            </p>
          </div>

          {/* Current Score Badge */}
          {isSubmitted && (
            <div className="flex items-center gap-3 bg-gradient-to-br from-pink-50 to-amber-50 p-4 rounded-2xl border border-pink-200">
              <div className="p-3 bg-white rounded-xl shadow-xs text-pink-600">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">나의 퀴즈 점수</div>
                <div className="text-2xl font-extrabold text-pink-600">{score}점 <span className="text-sm font-normal text-slate-400">/ 100점</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIndex) => {
            const userAnswer = selectedAnswers[q.id];
            const isAnswered = userAnswer !== undefined;
            const isCorrect = isSubmitted && userAnswer === q.correctIndex;
            const isWrong = isSubmitted && userAnswer !== q.correctIndex;

            return (
              <div
                key={q.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isSubmitted
                    ? isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                    : 'bg-slate-50/60 border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center mt-0.5">
                    Q{qIndex + 1}
                  </span>
                  <div className="space-y-3 flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                      {q.question}
                    </h4>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswer === optIdx;
                        let btnStyle = 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/40';

                        if (isSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-500 text-white font-bold border-emerald-500 shadow-xs';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-500 text-white font-bold border-rose-500';
                          } else {
                            btnStyle = 'bg-white text-slate-400 border-slate-200 opacity-60';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-pink-500 text-white font-bold border-pink-500 shadow-xs';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`px-4 py-3 rounded-xl border text-sm text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                            {isSubmitted && isSelected && optIdx !== q.correctIndex && (
                              <XCircle className="w-4 h-4 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation when submitted */}
                    {isSubmitted && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                            {isCorrect ? '정답입니다! 🎉 ' : '아쉬워요! 💡 '}
                          </strong>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            총 {QUIZ_QUESTIONS.length}문제 중 {Object.keys(selectedAnswers).length}문제 응답 완료
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {isSubmitted ? (
              <>
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 flex items-center gap-2 text-sm cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>다시 풀기</span>
                </button>
                <div className="px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>점수가 과제 제출 탭에 연동되었습니다!</span>
                </div>
              </>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>퀴즈 채점하고 점수 저장하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
