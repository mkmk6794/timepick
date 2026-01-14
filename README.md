# ⏰ TimePick - 스마트 그룹 일정 조율

여러 사람의 일정을 쉽게 조율하는 협업 스케줄링 애플리케이션

## 📋 주요 기능

### 주최자 (Organizer)
- 이벤트 생성 및 여러 제안 날짜/시간 추가
- 참석자 초대 (이메일 기반, 고유 응답 토큰 생성)
- 대시보드에서 참석 가능 현황 실시간 확인
- 최적의 시간 선택 및 확정
- 확정 메시지 자동 생성 (이메일/SMS)

### 참석자 (Participant)
- 고유한 응답 링크로 접속
- 참석 가능한 날짜/시간 선택 (복수 선택 가능)
- 응답 제출 및 확정 일정 확인

## 🛠 기술 스택

- **Frontend**: React 18, Vite, React Router, Framer Motion
- **Backend**: Express.js 5, Node.js 18+
- **Storage**: JSON 파일 기반 (data.json)
- **Styling**: Custom CSS (Dark Theme)

## 🚀 로컬 개발 환경

```bash
# 의존성 설치
npm run install:all

# 개발 서버 실행 (프론트엔드 + 백엔드 동시 실행)
npm run dev

# 프론트엔드: http://localhost:5173
# 백엔드: http://localhost:3001
```

## 📦 프로덕션 빌드

```bash
# 클라이언트 빌드
npm run build

# 프로덕션 서버 실행
NODE_ENV=production npm start
```

---

# 🌐 배포 가이드 (Railway)

## 방법 1: Railway 웹 대시보드 (권장)

### Step 1: GitHub 저장소 생성
1. GitHub에서 새 저장소 생성 (예: `timepick`)
2. 로컬에서 코드 푸시:
```bash
git remote add origin https://github.com/YOUR_USERNAME/timepick.git
git push -u origin main
```

### Step 2: Railway 프로젝트 생성
1. [Railway](https://railway.app) 접속 및 로그인
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. GitHub 연동 후 `timepick` 저장소 선택
5. **Deploy Now** 클릭

### Step 3: 환경 변수 설정
Railway 대시보드에서:
1. 배포된 서비스 클릭
2. **Variables** 탭으로 이동
3. 다음 변수 추가:
```
NODE_ENV=production
FRONTEND_URL=https://timepick.ai
```

### Step 4: 커스텀 도메인 연결
1. **Settings** 탭으로 이동
2. **Domains** 섹션에서 **Custom Domain** 추가
3. `timepick.ai` 입력
4. DNS 설정 안내에 따라 도메인 등록 업체에서 설정

### Step 5: SSL 인증서
- Railway가 자동으로 Let's Encrypt SSL 인증서를 발급합니다
- 도메인 연결 후 몇 분 내 HTTPS가 활성화됩니다

---

## 방법 2: Railway CLI

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 새 프로젝트 생성 및 연결
railway init

# 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://timepick.ai

# 배포
railway up

# 커스텀 도메인 추가
railway domain add timepick.ai
```

---

# 🔧 도메인 DNS 설정 (timepick.ai)

도메인 등록 업체(가비아, Namecheap, GoDaddy 등)에서:

### CNAME 레코드 설정
```
Type: CNAME
Name: @  (또는 빈칸)
Value: <your-app>.up.railway.app

Type: CNAME  
Name: www
Value: <your-app>.up.railway.app
```

> ⚠️ DNS 전파에 최대 24-48시간이 소요될 수 있습니다.

---

# 📁 프로젝트 구조

```
timepick/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── pages/         # 페이지 컴포넌트
│   │   │   ├── Home.jsx           # 랜딩 페이지
│   │   │   ├── CreateEvent.jsx    # 이벤트 생성
│   │   │   ├── EventSuccess.jsx   # 생성 완료
│   │   │   ├── Respond.jsx        # 참석자 응답
│   │   │   └── Dashboard.jsx      # 주최자 대시보드
│   │   └── components/    # 공통 컴포넌트
│   └── dist/              # 프로덕션 빌드
├── server/
│   └── index.js           # Express API 서버
├── package.json           # 루트 패키지
├── nixpacks.toml          # Railway 빌드 설정
└── railway.json           # Railway 배포 설정
```

---

# 🔌 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 확인 |
| POST | `/api/events` | 새 이벤트 생성 |
| GET | `/api/events/organizer/:token` | 주최자 대시보드 데이터 |
| GET | `/api/events/respond/:token` | 참석자 응답 페이지 데이터 |
| POST | `/api/responses` | 참석자 응답 제출 |
| POST | `/api/events/:id/confirm` | 일정 확정 |

---

# 📱 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `PORT` | 서버 포트 | 3001 |
| `NODE_ENV` | 실행 환경 | development |
| `FRONTEND_URL` | CORS 허용 도메인 | - |

---

## 📄 라이선스

MIT License

---

**TimePick** - 모두의 시간을 존중하는 스마트한 일정 조율 🕐
