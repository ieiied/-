/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Sliders,
  Music,
  Send,
  Sparkles,
  Headphones,
  GraduationCap,
  Heart
} from 'lucide-react';
import { TheoryQuizTab } from './components/TheoryQuizTab';
import { BandLabGuideTab } from './components/BandLabGuideTab';
import { InteractiveStudioTab } from './components/InteractiveStudioTab';
import { AssignmentSubmissionTab } from './components/AssignmentSubmissionTab';

type TabType = 'theory' | 'bandlab' | 'studio' | 'assignment';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('theory');
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleScoreSync = (score: number) => {
    setQuizScore(score);
  };

  const navTabs = [
    {
      id: 'theory' as const,
      label: '기초 음악 이론',
      sublabel: '카드뉴스 & 퀴즈',
      icon: BookOpen,
      badge: quizScore !== null ? `${quizScore}점` : '퀴즈 포함',
      badgeColor: quizScore !== null ? 'bg-emerald-100 text-emerald-800' : 'bg-pink-100 text-pink-700'
    },
    {
      id: 'bandlab' as const,
      label: 'AI 송스타터 작곡',
      sublabel: '초안 생성 & 감정 편곡',
      icon: Sliders,
      badge: 'SongStarter',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'studio' as const,
      label: '창작 맛보기',
      sublabel: '피아노 & 8비트 드럼',
      icon: Music,
      badge: 'Web Audio',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'assignment' as const,
      label: '과제 제출함',
      sublabel: 'Firestore 안전 제출',
      icon: Send,
      badge: quizScore !== null ? '연동 완료' : '점수 필요',
      badgeColor: quizScore !== null ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-pink-50/80 text-slate-800 flex flex-col font-sans">
      {/* Top Cute Notice Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 text-white text-xs sm:text-sm font-bold py-2 px-4 text-center shadow-xs flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin-slow" />
        <span>고등학생을 위한 밴드랩(BandLab) 송스타터 AI 초안 &amp; 감정 맞춤 작곡 스튜디오</span>
        <span className="hidden sm:inline bg-white/25 px-2 py-0.5 rounded-full text-[11px] font-semibold">
          2026 음악 창작 수업
        </span>
      </div>

      {/* Main App Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-amber-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-400 to-amber-400 text-white flex items-center justify-center shadow-md shadow-pink-200">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  작곡 첫걸음 <span className="text-pink-600 font-extrabold">Studio</span>
                </h1>
                <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                  AI 송스타터 수업
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                음악 이론 • AI 송스타터 초안 &amp; 감정 편곡 • 건반/비트 스튜디오 • 1:1 과제 제출
              </p>
            </div>
          </div>

          {/* Quick Status / Quiz Score Pill */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-2xl bg-pink-50 border border-pink-200 flex items-center gap-2 text-xs">
              <GraduationCap className="w-4 h-4 text-pink-600" />
              <span className="text-slate-600">퀴즈 점수:</span>
              <strong className="text-pink-600 font-extrabold">
                {quizScore !== null ? `${quizScore}점` : '미응시'}
              </strong>
            </div>

            <button
              onClick={() => setActiveTab('assignment')}
              className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>과제 제출하기</span>
            </button>
          </div>
        </div>

        {/* 4 Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-1">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-2 scrollbar-none" aria-label="Tabs">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[130px] sm:min-w-[170px] py-2.5 sm:py-3 px-3 rounded-2xl transition-all duration-200 text-left flex items-center gap-2.5 cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500/10 to-amber-500/10 border-pink-300 text-slate-900 shadow-xs ring-1 ring-pink-300'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    isActive
                      ? 'bg-gradient-to-br from-pink-500 to-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-pink-700' : 'text-slate-700'}`}>
                        {tab.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate hidden sm:block">
                      {tab.sublabel}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md hidden lg:inline ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'theory' && (
          <TheoryQuizTab
            onScoreSync={handleScoreSync}
            currentQuizScore={quizScore}
          />
        )}

        {activeTab === 'bandlab' && (
          <BandLabGuideTab />
        )}

        {activeTab === 'studio' && (
          <InteractiveStudioTab />
        )}

        {activeTab === 'assignment' && (
          <AssignmentSubmissionTab
            quizScore={quizScore}
            onNavigateToQuiz={() => setActiveTab('theory')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200/50 bg-white/60 backdrop-blur-xs py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>작곡 첫걸음 스튜디오 © 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-pink-600 font-semibold">
              <Heart className="w-3.5 h-3.5 fill-pink-500" /> 고교 음악 창작 수업용 웹앱
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('assignment')}
              className="hover:text-pink-600 hover:underline cursor-pointer"
            >
              과제 제출함
            </button>
            <span>•</span>
            <a
              href="https://www.bandlab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 hover:underline"
            >
              BandLab 바로가기
            </a>
            <span>•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
              Firestore 보안 규칙 적용됨
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
