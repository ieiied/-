import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Award,
  RefreshCw,
  Clock,
  Sparkles,
  Database
} from 'lucide-react';
import {
  submitAssignmentToStore,
  checkFirebaseConnection,
  getStoredReceipts,
  type FirebaseConnectionStatus,
  type StoredReceipt
} from '../firebase';
import confetti from 'canvas-confetti';

interface AssignmentSubmissionTabProps {
  quizScore: number | null;
  onNavigateToQuiz: () => void;
}

export const AssignmentSubmissionTab: React.FC<AssignmentSubmissionTabProps> = ({
  quizScore,
  onNavigateToQuiz
}) => {
  const [studentName, setStudentName] = useState<string>('');
  const [emotionTheme, setEmotionTheme] = useState<string>('설레는 첫사랑 💖');
  const [bandlabUrl, setBandlabUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<StoredReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<FirebaseConnectionStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [showRecoveryGuide, setShowRecoveryGuide] = useState<boolean>(false);
  const [myReceipts, setMyReceipts] = useState<StoredReceipt[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Load existing receipts and check initial connection
  useEffect(() => {
    setMyReceipts(getStoredReceipts());
    handleCheckConnection();
  }, []);

  const handleCheckConnection = async () => {
    setIsTestingConnection(true);
    try {
      const status = await checkFirebaseConnection();
      setConnectionStatus(status);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. 이름 검증
    if (!studentName.trim()) {
      setErrorMessage('학생 이름(학번 및 성명)을 반드시 입력해 주세요.');
      return;
    }

    if (studentName.trim().length > 50) {
      setErrorMessage('이름은 50자 이내로 입력해 주세요.');
      return;
    }

    // 2. BandLab URL 검증
    const trimmedUrl = bandlabUrl.trim();
    if (!trimmedUrl) {
      setErrorMessage('밴드랩(BandLab) 프로젝트 공유 링크를 입력해 주세요.');
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setErrorMessage('올바른 URL 형식(예: https://www.bandlab.com/post/...)으로 입력해 주세요.');
      return;
    }

    if (!trimmedUrl.toLowerCase().includes('bandlab.com')) {
      const proceed = window.confirm(
        '입력하신 링크에 "bandlab.com" 도메인이 포함되어 있지 않습니다. 이대로 제출을 진행하시겠습니까?'
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);

    try {
      const score = quizScore ?? 0;
      const result = await submitAssignmentToStore({
        studentName: studentName.trim(),
        quizScore: score,
        bandlabUrl: trimmedUrl,
        emotionTheme: emotionTheme.trim()
      });

      if (result.success) {
        setSubmitSuccess(true);
        const receipt: StoredReceipt = {
          id: result.id || 'rec_' + Date.now(),
          studentName: studentName.trim(),
          quizScore: score,
          bandlabUrl: trimmedUrl,
          emotionTheme: emotionTheme.trim(),
          timestamp: result.timestamp,
          mode: result.isLocalFallback ? 'local_storage' : 'firebase'
        };
        setSubmittedReceipt(receipt);
        setMyReceipts(getStoredReceipts());

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage('과제 제출 중 오류가 발생했습니다: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStudentName('');
    setBandlabUrl('');
    setSubmitSuccess(false);
    setSubmittedReceipt(null);
    setErrorMessage(null);
  };

  const recoveryPromptText = "metadata.json에 있는 파이어베이스 설정값들을 기반으로 .env 파일을 생성하고 firebase.js에 정상 연결해줘.";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(recoveryPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold border border-pink-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-pink-500" />
          <span>안전한 1:1 비공개 과제 제출 시스템</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          AI 송스타터 감정 작곡 <span className="text-pink-600 font-extrabold">과제 제출함</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          이름, 퀴즈 점수, 밴드랩 공유 링크를 입력하여 선생님께 제출하세요. 제출된 정보는 다른 학생에게 절대 공개되지 않습니다.
        </p>
      </div>

      {/* Firebase Connection Status & Diagnostics Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">데이터베이스 연동 상태:</span>
              {connectionStatus?.isConnected ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  클라우드 Firestore 연결됨
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  로컬 안전 저장 모드 동작 중
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {connectionStatus?.statusText || '연동 상태 확인 중...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckConnection}
            disabled={isTestingConnection}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
            <span>연결 상태 재확인</span>
          </button>

          <button
            onClick={() => setShowRecoveryGuide(prev => !prev)}
            className="px-4 py-2 rounded-xl bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>비상 복구 가이드</span>
          </button>
        </div>
      </div>

      {/* Emergency Recovery Guide Drawer */}
      {showRecoveryGuide && (
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Firebase 자동 연동 실패 시 비상 복구 가이드</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            AI Studio 자동 설정 중 팝업이 닫히거나 연동이 지연된 경우, 채팅창에 아래 복구 요청 문구를 그대로 입력해 주시면 즉시 정상 연동됩니다:
          </p>

          <div className="p-4 bg-white rounded-2xl border border-amber-300 flex items-center justify-between gap-3">
            <code className="text-xs sm:text-sm font-mono text-pink-700 font-bold break-all">
              "{recoveryPromptText}"
            </code>
            <button
              onClick={handleCopyPrompt}
              className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedPrompt ? '복사 완료!' : '문구 복사'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 space-y-1">
            <p>💡 <strong>Vercel 배포 시 환경 변수:</strong> Vercel 프로젝트 Settings &gt; Environment Variables에서 <code className="text-pink-600">VITE_FIREBASE_API_KEY</code>, <code className="text-pink-600">VITE_FIREBASE_PROJECT_ID</code> 등을 추가하시면 완벽하게 동작합니다.</p>
            <p>💡 <strong>로컬 안전 모드:</strong> Firebase가 아직 연결되지 않았더라도 본 화면에서 제출한 과제는 브라우저 로컬 스토리지에 안전하게 보관되어 손실되지 않습니다.</p>
          </div>
        </div>
      )}

      {/* Main Submission Form / Receipt Card */}
      {submitSuccess && submittedReceipt ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-emerald-200 space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              과제 제출 완료 영수증
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 pt-2">
              과제가 성공적으로 접수되었습니다! 🎉
            </h3>
            <p className="text-sm text-slate-500">
              선생님 평가 데이터베이스에 안전하게 등록되었습니다.
            </p>
          </div>

          {/* Receipt Details Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500">제출 학생</span>
              <span className="font-bold text-slate-800">{submittedReceipt.studentName}</span>
            </div>
            {submittedReceipt.emotionTheme && (
              <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                <span className="text-slate-500">표현한 감정 테마</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 text-xs">
                  {submittedReceipt.emotionTheme}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500">퀴즈 점수</span>
              <span className="font-bold text-pink-600">{submittedReceipt.quizScore}점 / 100점</span>
            </div>
            <div className="flex flex-col text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500 mb-1">BandLab 링크</span>
              <a
                href={submittedReceipt.bandlabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline font-mono text-xs break-all flex items-center gap-1"
              >
                <span>{submittedReceipt.bandlabUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>제출 접수 번호</span>
              <span className="font-mono">{submittedReceipt.id.substring(0, 18)}...</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>제출 일시</span>
              <span>{new Date(submittedReceipt.timestamp).toLocaleString('ko-KR')}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleResetForm}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              다른 과제 추가 제출하기
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-pink-100 space-y-6"
        >
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>
                <strong>제출 오류: </strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* 1. Student Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              학생 이름 및 학번 <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="예: 2학년 3반 15번 홍길동"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-800 text-sm placeholder:text-slate-400 outline-hidden transition-all bg-slate-50/50"
            />
            <p className="text-xs text-slate-400">
              선생님께서 성적을 확인하실 수 있도록 학번과 이름을 정확히 입력하세요.
            </p>
          </div>

          {/* 2. Emotion Theme (SongStarter AI emotion customization) */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              곡에 담아 표현한 나의 감정 / 테마 <span className="text-pink-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 pb-1">
              {['💖 설레는 첫사랑', '🌧️ 비 오는 날의 쓸쓸함', '🔥 시험 끝난 해방감', '🌿 나른한 일요일 휴식', '🌙 몽환적인 새벽 감성'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setEmotionTheme(chip)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    emotionTheme === chip
                      ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={emotionTheme}
              onChange={(e) => setEmotionTheme(e.target.value)}
              placeholder="직접 입력하거나 위 추천 칩을 누르세요 (예: 늦은 밤 혼자 듣는 쓸쓸한 피아노 곡)"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-800 text-sm placeholder:text-slate-400 outline-hidden transition-all bg-slate-50/50"
            />
            <p className="text-xs text-slate-400">
              송스타터(SongStarter) AI 초안을 어떤 감정선으로 수정·편곡했는지 적어주세요.
            </p>
          </div>

          {/* 2. Quiz Score (Auto-linked from Tab 1) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-700">
                기초 음악 이론 퀴즈 점수
              </label>
              <button
                type="button"
                onClick={onNavigateToQuiz}
                className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>퀴즈 다시 풀러 가기</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-50/70 to-amber-50/70 border border-pink-200">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-pink-600">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1">
                {quizScore !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-pink-600">{quizScore}점</span>
                    <span className="text-xs text-slate-500">/ 100점 (1번 탭에서 자동 연동 완료)</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    아직 1번 탭의 퀴즈를 풀지 않았습니다 (기본값: 0점).{' '}
                    <button
                      type="button"
                      onClick={onNavigateToQuiz}
                      className="text-pink-600 font-bold underline cursor-pointer"
                    >
                      지금 퀴즈 풀기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. BandLab Project URL */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              BandLab 프로젝트 공유 링크 (URL) <span className="text-pink-500">*</span>
            </label>
            <input
              type="url"
              required
              value={bandlabUrl}
              onChange={(e) => setBandlabUrl(e.target.value)}
              placeholder="예: https://www.bandlab.com/post/xxxxxx 또는 https://www.bandlab.com/track/xxxxxx"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-slate-800 text-sm font-mono placeholder:text-slate-400 outline-hidden transition-all bg-slate-50/50"
            />
            <p className="text-xs text-slate-400">
              2번 탭 가이드를 참고하여 밴드랩 상단 [Share &gt; Share Link]에서 생성된 웹 링크를 복사해 붙여넣으세요.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>학생 개인정보 보호 안내: </strong>
              제출하신 과제와 링크는 교사용 데이터베이스에만 기록되며, 다른 학생들은 열람할 수 없도록 Cloud Firestore Security Rules로 철저히 보호됩니다.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>안전하게 과제 제출 중...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>선생님께 과제 제출하기</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* My Local Submissions History (Private to student machine) */}
      {myReceipts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h4 className="text-base font-bold text-slate-800">
              내 기기 제출 기록 ({myReceipts.length}건)
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            본 브라우저에서 제출했던 내역입니다. 다른 학생의 제출 내용은 표시되지 않습니다.
          </p>

          <div className="divide-y divide-slate-100">
            {myReceipts.map((r, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-800 mr-2">{r.studentName}</span>
                  {r.emotionTheme && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md mr-2">
                      {r.emotionTheme}
                    </span>
                  )}
                  <span className="text-pink-600 font-semibold mr-2">퀴즈: {r.quizScore}점</span>
                  <span className="text-slate-400 font-mono text-[11px] truncate max-w-xs block sm:inline">
                    {r.bandlabUrl}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <span>{new Date(r.timestamp).toLocaleDateString('ko-KR')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    제출완료
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
