import React, { useState } from 'react';
import {
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
  ChevronRight,
  Wand2,
  Sliders,
  Volume2,
  Share2,
  Heart,
  CloudRain,
  Flame,
  Leaf,
  Moon,
  Copy,
  Check
} from 'lucide-react';

interface EmotionPreset {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  bgLight: string;
  borderColor: string;
  keywords: string;
  bpmRange: string;
  instrumentTips: string;
  arrangementTips: string;
}

const EMOTION_PRESETS: EmotionPreset[] = [
  {
    id: 'love',
    name: '설렘 / 풋풋한 사랑',
    icon: Heart,
    badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
    bgLight: 'bg-pink-50/60',
    borderColor: 'border-pink-200',
    keywords: 'first love flutter spring heart sweet acoustic 💖🌸',
    bpmRange: '100 ~ 112 BPM (경쾌한 미디엄 템포)',
    instrumentTips: 'AI가 만든 강한 신스 대신 따뜻한 어쿠스틱 피아노, 부드러운 나일론 기타, 밝은 글로켄슈필(종소리)을 추천합니다.',
    arrangementTips: '초반에는 피아노 반주로 수줍게 시작하다가 후렴구에서 가벼운 8비트 드럼과 하이햇을 넣어 심장이 두근거리는 느낌을 표현해 보세요.'
  },
  {
    id: 'sad',
    name: '쓸쓸함 / 비 오는 날 / 이별',
    icon: CloudRain,
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    bgLight: 'bg-blue-50/60',
    borderColor: 'border-blue-200',
    keywords: 'rainy afternoon melancholy tears lonely lo-fi piano 🌧️💔',
    bpmRange: '68 ~ 78 BPM (느리고 차분한 템포)',
    instrumentTips: 'AI의 시끄러운 드럼 트랙을 과감히 뮤트(Mute)하고, 로파이 피아노(Lo-Fi Piano)와 애절한 첼로/스트링 현악기를 배치하세요.',
    arrangementTips: '여백(쉼표)을 많이 남기고, 리버브(Reverb, 울림) 효과를 살짝 키워 텅 빈 방 안이나 빗속을 걷는 고독한 분위기를 연출합니다.'
  },
  {
    id: 'hype',
    name: '신나는 축제 / 시험 끝난 해방감',
    icon: Flame,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    bgLight: 'bg-amber-50/60',
    borderColor: 'border-amber-200',
    keywords: 'freedom summer party energetic festival bounce fun 🔥🏖️',
    bpmRange: '124 ~ 132 BPM (심장을 뛰게 하는 댄스 템포)',
    instrumentTips: '묵직한 808 킥 드럼, 펀치감 있는 베이스 신스, 신나는 브라스(금관악기) 브라스 스탭을 활용하세요.',
    arrangementTips: 'AI 초안의 드럼 루프에 16비트 롤링 하이햇을 추가하고, 빌드업(Build-up) 구간에서 스네어를 점점 빠르게 연타하여 해방감을 폭발시키세요.'
  },
  {
    id: 'chill',
    name: '평온한 휴식 / 나른한 오후',
    icon: Leaf,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgLight: 'bg-emerald-50/60',
    borderColor: 'border-emerald-200',
    keywords: 'lazy afternoon chill cafe warm breeze vintage ep 🌿☕',
    bpmRange: '82 ~ 92 BPM (편안하게 그루브를 타는 템포)',
    instrumentTips: '일렉트릭 피아노(Rhodes/Wurlitzer), 몽환적인 신스 패드, 따뜻한 우드 베이스를 사용합니다.',
    arrangementTips: '복잡한 멜로디보다는 반복되는 4코드 진행 위에 부드러운 재즈 핑거스냅이나 브러시 드럼 소리를 얹어 나른함을 살립니다.'
  },
  {
    id: 'dreamy',
    name: '새벽 감성 / 몽환적인 고민',
    icon: Moon,
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    bgLight: 'bg-purple-50/60',
    borderColor: 'border-purple-200',
    keywords: 'midnight thoughts galaxy dreamy ethereal synth ambient 🌙✨',
    bpmRange: '85 ~ 105 BPM (자유로운 공간감)',
    instrumentTips: '아르페지에이터(Arpeggiator) 신디사이저, 앰비언트 사운드스케이프, 딜레이(Delay)가 걸린 일렉트릭 기타를 활용하세요.',
    arrangementTips: '정박자의 드럼 대신 당김음(Syncopation) 비트를 배치하고, 페이드인(Fade-in) 효과로 서서히 밤하늘 속으로 빠져드는 느낌을 줍니다.'
  }
];

export const BandLabGuideTab: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [selectedEmotion, setSelectedEmotion] = useState<string>('love');
  const [copiedKeyword, setCopiedKeyword] = useState<boolean>(false);

  const toggleStepCompleted = (stepIdx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  const currentEmotion = EMOTION_PRESETS.find(e => e.id === selectedEmotion) || EMOTION_PRESETS[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentEmotion.keywords);
    setCopiedKeyword(true);
    setTimeout(() => setCopiedKeyword(false), 2000);
  };

  const steps = [
    {
      stepNumber: '01',
      title: 'SongStarter AI로 내 감정 초안 3가지 뽑기',
      subtitle: '내 기분과 감정을 단어·이모지로 입력하여 AI 음악 아이디어 생성!',
      icon: Wand2,
      badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
      description: 'BandLab의 AI 생성 도구인 SongStarter는 키워드, 분위기, 이모지 하나로 3가지의 독창적인 음악 초안을 제안합니다.',
      instructions: [
        {
          title: 'SongStarter 도구 열기',
          content: 'BandLab 메인 화면 상단 또는 [+ Create] 메뉴에서 [SongStarter (송스타터 🪄)] 아이콘을 클릭합니다.'
        },
        {
          title: '나의 감정 키워드 & 이모지 입력',
          content: '입력창에 오늘의 내 감정(예: "비 오는 날의 쓸쓸함 🌧️" 또는 "first love sweet piano 💖")을 입력하고 [Generate] 버튼을 누릅니다.'
        },
        {
          title: '3가지 AI 초안 미리듣고 선택하기',
          content: 'AI가 만들어준 3가지 버전(주사위 아이콘)을 각각 재생해 보고, 내가 표현하고 싶은 감정과 가장 가까운 트랙을 고릅니다.'
        }
      ],
      tip: '아래의 [감정 사전 위젯]에서 원하는 감정을 클릭하고 [키워드 복사]를 누르면 SongStarter에 바로 붙여넣을 수 있어요!'
    },
    {
      stepNumber: '02',
      title: '스튜디오(DAW)로 불러와 트랙 해부하기',
      subtitle: 'AI가 만든 드럼, 베이스, 신스, 멜로디 트랙을 내 작업실로 임포트!',
      icon: Sliders,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: '선택한 AI 초안을 전문 멀티트랙 스튜디오로 가져와 어떤 악기들이 어떻게 연주되고 있는지 구조를 분석합니다.',
      instructions: [
        {
          title: 'Open in Studio 버튼 클릭',
          content: '마음에 드는 AI 음악 초안 화면 아래의 초록색/흰색 [Open in Studio (스튜디오에서 열기)] 버튼을 누릅니다.'
        },
        {
          title: '악기별 분리 트랙(Tracks) 확인',
          content: '스튜디오에 드럼(Drum), 베이스(Bass), 코드(Chords), 멜로디(Melody)가 각 트랙별로 분리되어 배치된 것을 확인합니다.'
        },
        {
          title: '템포(BPM)를 내 감정의 호흡에 맞추기',
          content: '상단 BPM 숫자를 클릭해 내 감정이 슬프다면 조금 느리게(72~78), 신난다면 조금 빠르게(124~128) 조절해 봅니다.'
        }
      ],
      tip: '각 트랙 왼쪽의 [S (솔로)] 버튼을 누르면 그 악기 소리만 따로 들을 수 있어서 AI가 무슨 음을 썼는지 쉽게 파악할 수 있어요.'
    },
    {
      stepNumber: '03',
      title: '내 감정에 맞게 악기 수정 & 덜어내기',
      subtitle: 'AI의 기계적인 부분을 삭제하고, 내 감정에 맞는 악기 음색으로 교체!',
      icon: Volume2,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      description: '진정한 창작은 "선택과 수정"에서 시작됩니다. 감정에 방해되는 소리는 끄고, 어울리는 감성 악기로 재편곡합니다.',
      instructions: [
        {
          title: '감정에 방해되는 트랙 뮤트(Mute) 또는 삭제',
          content: 'AI가 만든 소리 중 너무 시끄럽거나 내 감정과 맞지 않는 트랙은 [M (뮤트)] 버튼을 누르거나 우클릭하여 삭제합니다.'
        },
        {
          title: '가상 악기(Virtual Instrument) 음색 바꾸기',
          content: '트랙의 악기 아이콘을 클릭하여 내 감정에 맞는 소리(예: 전자 신스 → 따뜻한 Grand Piano 또는 Strings)로 변경합니다.'
        },
        {
          title: '볼륨 밸런스(믹싱) 조절하기',
          content: '감정을 가장 잘 전달하는 메인 악기의 볼륨 슬라이더는 올리고, 배경 소리는 살짝 줄여 감정의 입체감을 만듭니다.'
        }
      ],
      tip: '모든 소리가 다 크면 감정이 전달되지 않아요! "무엇을 남기고 무엇을 버릴 것인가"가 훌륭한 작곡가의 핵심 능력입니다.'
    },
    {
      stepNumber: '04',
      title: '나만의 감정 멜로디 추가 & 링크 제출',
      subtitle: '컴퓨터 키보드로 내 감정 멜로디를 녹음하고 공유 링크 복사!',
      icon: Share2,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: '편곡된 반주 위에 내가 직접 만든 2마디 감정 멜로디를 레코딩하고, 완성된 곡의 링크를 과제함에 제출합니다.',
      instructions: [
        {
          title: '새 트랙 추가 > 가상 악기 건반 녹음',
          content: '[+ Add Track] > [Virtual Instruments]를 눌러 피아노/리드를 띄운 뒤, 컴퓨터 키보드로 내 감정을 담은 멜로디를 녹음(●)합니다.'
        },
        {
          title: '프로젝트 저장 (감정 태그 필수)',
          content: '우측 상단 [Save]를 누르고 제목을 [학번_이름_표현감정_곡제목] (예: 20315_홍길동_비오는날의쓸쓸함_RainyWalk)으로 작성합니다.'
        },
        {
          title: '공유 링크(Share Link) 복사 후 과제함 제출',
          content: '[Publish/Share] > [Share Link]를 선택하여 생성된 https://www.bandlab.com/post/... 주소를 복사해 4번 탭 과제 제출함에 제출하세요!'
        }
      ],
      tip: '공유 링크 설정이 비공개(Private)로 되어 있으면 선생님이 청음 평가를 하실 수 없으니, 꼭 "Public" 상태로 공유해 주세요.'
    }
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Intro Header (Clean solid colors with NO masking bugs!) */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold border border-amber-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>AI 도구와 인간의 감성이 만나는 창작 수업</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          BandLab <span className="text-pink-600 font-extrabold">송스타터(SongStarter) AI 감정 작곡 가이드</span>
        </h2>
        <p className="text-slate-600 max-w-3xl mx-auto text-base leading-relaxed">
          밴드랩의 <strong>SongStarter(송스타터)</strong>로 내 감정 키워드가 담긴 AI 음악 초안을 뽑고,
          스튜디오에서 <strong>악기 교체 • 템포 조절 • 멜로디 직접 녹음</strong>을 통해 진짜 내 감정의 곡으로 재편곡해 보세요!
        </p>

        {/* BandLab Outbound CTA */}
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <a
            href="https://www.bandlab.com/songstarter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Wand2 className="w-4 h-4" />
            <span>BandLab SongStarter 실행하기</span>
            <ExternalLink className="w-4 h-4 text-white/80" />
          </a>

          <a
            href="https://www.bandlab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
          >
            <span>BandLab 메인 스튜디오 열기</span>
            <ExternalLink className="w-4 h-4 text-pink-400" />
          </a>
        </div>
      </div>

      {/* INTERACTIVE EMOTION PRESET DICTIONARY */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pink-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>실전 감정 작곡 도우미</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              🎨 표현하고 싶은 감정을 고르고 추천 설정을 확인하세요
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">클릭 시 추천 키워드와 편곡 팁이 변경됩니다</span>
        </div>

        {/* Emotion Pills */}
        <div className="flex flex-wrap gap-2.5">
          {EMOTION_PRESETS.map((ep) => {
            const isSelected = selectedEmotion === ep.id;
            const Icon = ep.icon;
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedEmotion(ep.id)}
                className={`px-4 py-2.5 rounded-2xl border text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white border-transparent shadow-md scale-105'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-pink-50 hover:border-pink-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-pink-500'}`} />
                <span>{ep.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Emotion Detail Card */}
        <div className={`p-6 rounded-2xl border ${currentEmotion.borderColor} ${currentEmotion.bgLight} space-y-4 animate-fadeIn`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${currentEmotion.badgeColor}`}>
                {currentEmotion.name} 감정 테마
              </span>
              <span className="text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200">
                추천 템포: {currentEmotion.bpmRange}
              </span>
            </div>

            {/* Copy Prompt Button */}
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-pink-400 text-xs font-bold text-slate-700 hover:text-pink-600 shadow-xs cursor-pointer transition-colors"
            >
              {copiedKeyword ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SongStarter 키워드 복사</span>
                </>
              )}
            </button>
          </div>

          {/* Keyword Pill */}
          <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-bold mr-2">SongStarter 추천 입력 프롬프트:</span>
            <code className="font-mono text-pink-700 font-bold break-all flex-1 text-right">
              {currentEmotion.keywords}
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-amber-800">
                <span>🎹 추천 악기 음색 교체:</span>
              </h5>
              <p className="text-slate-600 leading-relaxed">{currentEmotion.instrumentTips}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-pink-700">
                <span>💡 감정선 살리는 편곡 포인트:</span>
              </h5>
              <p className="text-slate-600 leading-relaxed">{currentEmotion.arrangementTips}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Step Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const isActive = activeStep === idx;
          const isDone = completedSteps[idx];
          const Icon = s.icon;

          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                isActive
                  ? 'bg-white border-pink-400 shadow-md ring-2 ring-pink-300/40'
                  : 'bg-white/70 border-slate-200 hover:bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${s.badgeColor}`}>
                  STEP {s.stepNumber}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepCompleted(idx);
                  }}
                  className="cursor-pointer"
                  title="완료 체크하기"
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : 'text-slate-500'}`} />
                <span className="text-sm font-bold text-slate-800 truncate">{s.title.split(' ')[0]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Step Detailed Card */}
      {steps[activeStep] && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-amber-100 space-y-8 animate-fadeIn">
          {/* Header of Active Step */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${steps[activeStep].badgeColor}`}>
                  STEP {steps[activeStep].stepNumber}
                </span>
                <span className="text-xs text-slate-400 font-semibold">AI 송스타터 실전 작곡 {activeStep + 1}/4 단계</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
                {steps[activeStep].title}
              </h3>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                {steps[activeStep].subtitle}
              </p>
            </div>

            <button
              onClick={() => toggleStepCompleted(activeStep)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                completedSteps[activeStep]
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
              }`}
            >
              {completedSteps[activeStep] ? (
                <>
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>이 단계 실습 완료!</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>실습 완료 표시하기</span>
                </>
              )}
            </button>
          </div>

          {/* Detailed Instructions Grid */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-700">📌 단계별 실습 행동 요령</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps[activeStep].instructions.map((inst, iIdx) => (
                <div
                  key={iIdx}
                  className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-400 to-amber-400 text-white font-bold text-xs flex items-center justify-center mb-3">
                      {iIdx + 1}
                    </div>
                    <h5 className="font-bold text-slate-800 text-base mb-2">{inst.title}</h5>
                    <p className="text-sm text-slate-600 leading-relaxed">{inst.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-pink-50/80 border border-pink-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-pink-700 font-bold">음악 선생님의 작곡 조언: </strong>
              {steps[activeStep].tip}
            </div>
          </div>

          {/* Navigation between steps */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              이전 단계
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>다음 단계로</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                🎉 모든 가이드를 완료했습니다! 이제 4번 탭에서 과제 링크를 제출하세요.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
