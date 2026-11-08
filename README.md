# 🎶 작곡 첫걸음 (Music Studio Guide)
> **고등학생을 위한 밝고 귀여운 작곡 입문, BandLab(밴드랩) 가이드 & 인터랙티브 음악 스튜디오**

![License](https://img.shields.io/badge/license-Apache--2.0-pink.svg)
![React](https://img.shields.io/badge/React-19.0-rose.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-amber.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-purple.svg)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)

---

## 🌟 프로젝트 소개
**'작곡 첫걸음 Studio'**는 음악 수업 및 방과 후 작곡 동아리 고등학생들을 위해 제작된 웹 애플리케이션입니다.  
어려운 전통 화성학 대신, 대중음악과 K-POP에서 널리 쓰이는 **8비트 리듬, 머니 코드(C-G-Am-F), 모티브 작곡 원리**를 숏폼 카드뉴스로 배우고, 무료 클라우드 작곡 프로그램인 **BandLab(밴드랩)**을 활용하여 15분 만에 자신만의 곡을 만들 수 있도록 안내합니다.

또한 별도 음원 파일 로딩 없이 100% 브라우저 내장 **Web Audio API**로 구현된 **가상 웹 피아노**와 **16스텝 8비트 드럼 머신**을 통해 누구나 직접 건반을 치고 비트를 찍어볼 수 있습니다.

---

## 🎹 핵심 기능 4가지

### 1. 🎼 기초 음악 이론 & 실시간 채점 퀴즈
- **4가지 실전 레슨 카드뉴스:**
  1. *박자와 리듬의 비밀* (4/4 박자, 8분음표, BPM)
  2. *마법의 도레미 음계* (C Major Scale, 온음과 반음, 으뜸음)
  3. *삼화음과 히트 코드* (메이저/마이너 화음, 황금 4코드 진행)
  4. *쏙 꽂히는 멜로디 작곡* (동기(Motive) 발전 및 반복 변형 법칙)
- **미리듣기 사운드 지원:** 버튼을 누르면 각 이론의 음계, 화음 진행, 멜로디 예시가 오디오로 재생됩니다.
- **5문항 평가 퀴즈:** 정답 제출 즉시 점수(0~100점)가 실시간 계산되며, **과제 제출함 탭으로 자동 연동**됩니다.

### 2. 🎛️ BandLab(밴드랩) 스튜디오 가이드
- 웹 브라우저 기반 무료 작곡 DAW 밴드랩의 단계별 실습 가이드:
  - **STEP 01:** 가입 & 새 프로젝트 생성
  - **STEP 02:** BandLab Sounds 루프(드럼, 베이스) 드래그로 반주 쌓기
  - **STEP 03:** 가상 악기(Virtual Instrument)로 멜로디 연주 및 녹음
  - **STEP 04:** 프로젝트 저장 및 공유 링크(Share Link) 추출
- 각 단계별 실습 완료 체크리스트와 음악 선생님의 실전 작곡 꿀팁 제공

### 3. 🎹 창작 맛보기 스튜디오 (Web Audio Synth)
- **가상 웹 피아노 (Synthesizer Piano):**
  - 마우스 클릭 및 컴퓨터 키보드(`A, S, D, F, G, H, J, K...`) 연주 지원
  - 다채로운 화음(Chord) 원클릭 연주 (`C, Dm, Em, F, G, Am`)
  - 옥타브 이동 기능(-1, 기본, +1) 및 계이름(도레미) 표시 토글
- **16스텝 8비트 드럼 머신 (Drum Sequencer):**
  - 킥(Kick), 스네어(Snare), 하이햇(Hi-Hat), 클랩(Clap) 4채널
  - 템포 조절(70~150 BPM) 및 실시간 러닝 플레이헤드
  - 팝 락, EDM 4온더플로어, 칠 로파이 힙합, K-POP 트랩 장르 프리셋 제공

### 4. 📤 안전한 1:1 과제 제출함
- 별도 로그인 없이 **'학생 이름/학번'**, **'자동 연동된 퀴즈 점수'**, **'BandLab 공유 링크'**를 입력하여 제출
- **철저한 개인정보 보호:** 제출된 데이터는 Cloud Firestore에 비공개 저장되며, 다른 학생들은 조회하거나 변조할 수 없습니다.
- 제출 성공 시 콘페티(폭죽) 축하 효과 및 제출 확인 영수증 카드 발급
- 네트워크 지연 또는 Firebase 설정 이전 상태에서도 과제가 유실되지 않도록 **로컬 안전 저장(Fallback) 모드** 기본 내장

---

## 🎨 UI 및 디자인 콘셉트
- **파스텔 작곡 스튜디오 테마:** 밝고 따뜻한 옐로우, 피치 핑크, 크림 앰버 톤 기반
- **반응형 최적화:** 모바일 스마트폰, 태블릿, PC 브라우저 완벽 대응
- 부드러운 라운딩(`rounded-3xl`), 마이크로 인터랙션 및 시각적 피드백 제공

---

## 🔒 Cloud Firestore 보안 규칙 (`firestore.rules`)
학생들이 타인의 과제 정보 및 BandLab 링크를 무단 조회(스크래핑)하거나 수정하지 못하도록 엄격한 규칙이 적용되어 있습니다.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 전역 차단
    match /{document=**} {
      allow read, write: if false;
    }

    // 학생 과제 제출 컬렉션
    match /assignments/{assignmentId} {
      // 1. 과제 제출: 엄격한 데이터 유효성 검증 통과 시 생성 허용
      allow create: if request.resource.data.keys().hasAll(['studentName', 'quizScore', 'bandlabUrl']) &&
                      request.resource.data.studentName is string &&
                      request.resource.data.studentName.size() >= 1 &&
                      request.resource.data.studentName.size() <= 50 &&
                      request.resource.data.quizScore is number &&
                      request.resource.data.quizScore >= 0 &&
                      request.resource.data.quizScore <= 100 &&
                      request.resource.data.bandlabUrl is string &&
                      request.resource.data.bandlabUrl.size() <= 300;

      // 2. 다른 학생의 열람 전면 차단 (목록 조회 및 단건 조회 불가)
      allow read: if false;

      // 3. 제출 후 임의 위변조 및 삭제 불가
      allow update, delete: if false;
    }
  }
}
```

---

## 🚀 GitHub 커밋 & Vercel 배포 가이드

### 1단계: GitHub 저장소에 커밋 및 푸시
```bash
# 1. git 초기화 (처음 한 번만)
git init
git add .
git commit -m "feat: 고교생을 위한 작곡 입문 가이드 및 밴드랩 스튜디오 구축"

# 2. GitHub 원격 저장소 연결 후 푸시
git branch -M main
git remote add origin https://github.com/당신의_유저네임/저장소_이름.git
git push -u origin main
```

### 2단계: Vercel에 배포하기
1. [Vercel](https://vercel.com) 로그인 후 **"Add New Project"** 클릭
2. 방금 푸시한 GitHub 저장소를 선택(Import)합니다.
3. **Framework Preset**: `Vite` 자동 감지 확인
4. 아래의 **환경 변수(Environment Variables)**를 등록합니다.

---

## 📋 Vercel 환경 변수 목록 (복사용)

Vercel 프로젝트 대시보드의 **Settings > Environment Variables**에 아래 변수를 추가하세요.  
(Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱(웹)에서 확인한 값을 입력합니다)

| 변수 이름 (Name) | 설명 | 예시 값 |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API 키 | `AIzaSyD...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 | `my-school-music.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | `my-school-music` |
| `VITE_FIREBASE_STORAGE_BUCKET` | 스토리지 버킷 URL | `my-school-music.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 메시징 발신자 ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase 웹 앱 ID | `1:123456789012:web:abcdef` |
| `VITE_FIREBASE_DATABASE_ID` | (선택) Firestore DB ID | `(default)` |

> **팁:** 환경 변수를 설정하지 않아도 브라우저의 **로컬 안전 모드**로 동작하여 모든 기능(이론, 퀴즈, 피아노, 드럼, 제출 확인증)을 즉시 정상 체험할 수 있습니다.

---

## 🛠️ 비상 복구 가이드 문구
AI Studio 개발 환경에서 Firebase 자동 연동 팝업이 닫히거나 연결이 끊어졌을 때 채팅창에 아래 문구를 입력하세요:

```text
metadata.json에 있는 파이어베이스 설정값들을 기반으로 .env 파일을 생성하고 firebase.js에 정상 연결해줘.
```

---

## 💻 로컬 개발 환경 실행 방법
```bash
# 패키지 설치
npm install

# 로컬 개발 서버 실행 (포트 3000)
npm run dev

# 빌드 테스트
npm run build
```
