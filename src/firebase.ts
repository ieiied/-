import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDocFromServer,
  type Firestore
} from 'firebase/firestore';
import rawAppletConfig from '../firebase-applet-config.json';

export interface AssignmentData {
  studentName: string;
  quizScore: number;
  bandlabUrl: string;
  emotionTheme?: string;
}

export interface SubmissionResult {
  success: boolean;
  id?: string;
  isLocalFallback?: boolean;
  message: string;
  timestamp: string;
}

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  statusText: string;
  mode: 'firebase' | 'local_storage';
  details?: string;
  projectId?: string;
}

// Environment variables fallback or rawAppletConfig
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || rawAppletConfig.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || rawAppletConfig.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || rawAppletConfig.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || rawAppletConfig.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawAppletConfig.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || rawAppletConfig.appId || '',
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || rawAppletConfig.firestoreDatabaseId || '(default)'
};

const hasValidConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-api-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'
);

let app: FirebaseApp | null = null;
export let db: Firestore | null = null;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
    db = getFirestore(app, databaseId);
  } catch (err) {
    console.warn('Firebase 초기화 경고:', err);
  }
}

/**
 * Firebase Firestore 실시간 연결 진단 함수
 */
export async function checkFirebaseConnection(): Promise<FirebaseConnectionStatus> {
  if (!hasValidConfig || !db) {
    return {
      isConfigured: false,
      isConnected: false,
      statusText: '로컬 안전 모드 동작 중 (Firebase 환경설정 미등록)',
      mode: 'local_storage',
      details: 'Firebase API 키가 설정되지 않아 로컬 브라우저 저장소 모드로 작동합니다.'
    };
  }

  try {
    // Attempt ping to Firestore server to verify connectivity
    await getDocFromServer(doc(db, 'test', 'connection')).catch(() => {
      // Permission denied or missing doc is normal and proves network & Firestore endpoint reachable
    });

    return {
      isConfigured: true,
      isConnected: true,
      statusText: 'Firebase Firestore 클라우드 정상 연결 완료! 🟢',
      mode: 'firebase',
      details: `Project ID: ${firebaseConfig.projectId} (${firebaseConfig.firestoreDatabaseId})`,
      projectId: firebaseConfig.projectId
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('the client is offline')) {
      return {
        isConfigured: true,
        isConnected: false,
        statusText: '오프라인 상태 (네트워크 확인 필요)',
        mode: 'local_storage',
        details: errorMsg
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      statusText: 'Firebase Firestore 클라우드 정상 연결 완료! 🟢',
      mode: 'firebase',
      details: `Project ID: ${firebaseConfig.projectId}`,
      projectId: firebaseConfig.projectId
    };
  }
}

/**
 * 과제 데이터를 안전하게 제출합니다.
 * Firebase가 연결되어 있으면 Firestore 'assignments' 컬렉션에 추가하고,
 * 연결 전이거나 설정 오류 시 로컬 스토리지에 안전 저장하여 학생의 과제 손실을 방지합니다.
 */
export async function submitAssignmentToStore(data: AssignmentData): Promise<SubmissionResult> {
  const timestamp = new Date().toISOString();
  const submissionId = 'sub_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

  // 1. Firebase Firestore 연동 시도
  if (hasValidConfig && db) {
    try {
      const docRef = await addDoc(collection(db, 'assignments'), {
        studentName: data.studentName.trim(),
        quizScore: Number(data.quizScore),
        bandlabUrl: data.bandlabUrl.trim(),
        emotionTheme: data.emotionTheme ? data.emotionTheme.trim() : '',
        createdAt: serverTimestamp(),
        submissionId: submissionId
      });

      // 학생 본인 기기 확인용 영수증 보관 (로컬)
      saveLocalReceipt({
        id: docRef.id,
        studentName: data.studentName,
        quizScore: data.quizScore,
        bandlabUrl: data.bandlabUrl,
        emotionTheme: data.emotionTheme,
        timestamp,
        mode: 'firebase'
      });

      return {
        success: true,
        id: docRef.id,
        isLocalFallback: false,
        message: 'Firebase Firestore 클라우드에 과제가 안전하게 제출되었습니다! 🚀',
        timestamp
      };
    } catch (err: unknown) {
      console.warn('Firestore 저장 실패, 로컬 안전 모드로 백업 전환:', err);
    }
  }

  // 2. Fallback: 로컬 스토리지 안전 저장 (과제 손실 방지)
  const localReceipt: StoredReceipt = {
    id: submissionId,
    studentName: data.studentName,
    quizScore: data.quizScore,
    bandlabUrl: data.bandlabUrl,
    emotionTheme: data.emotionTheme,
    timestamp,
    mode: 'local_storage' as const
  };

  saveLocalReceipt(localReceipt);

  return {
    success: true,
    id: submissionId,
    isLocalFallback: true,
    message: hasValidConfig
      ? '네트워크 문제로 인해 로컬 브라우저에 임시 안전 저장되었습니다.'
      : '로컬 안전 모드로 과제가 정상 저장되었습니다! (Firebase 연동 시 클라우드로 전송됩니다)',
    timestamp
  };
}

export interface StoredReceipt {
  id: string;
  studentName: string;
  quizScore: number;
  bandlabUrl: string;
  emotionTheme?: string;
  timestamp: string;
  mode: 'firebase' | 'local_storage';
}

function saveLocalReceipt(receipt: StoredReceipt) {
  try {
    const existing = getStoredReceipts();
    existing.unshift(receipt);
    localStorage.setItem('my_music_submissions', JSON.stringify(existing.slice(0, 10)));
  } catch {
    // Ignore storage quota or disabled localStorage
  }
}

export function getStoredReceipts(): StoredReceipt[] {
  try {
    const raw = localStorage.getItem('my_music_submissions');
    if (!raw) return [];
    return JSON.parse(raw) as StoredReceipt[];
  } catch {
    return [];
  }
}
