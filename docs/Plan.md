# MembershipFlow Front MVP 구현 계획

이 문서는 MembershipFlow 프론트엔드 MVP의 구현 순서와 책임 경계를 정리한다.

---

## 1. 한 줄 정의

> 회원권 시세를 한눈에 조회하고, 목표가 알림을 설정하며, 프리미엄 구독으로 풀 기능을 사용하는 모바일 웹 프론트엔드 MVP.

---

## 2. 기술 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 차트 | Recharts |
| 아이콘 | Lucide React |
| 데이터 패칭 | SWR |
| 테스트 | Jest + React Testing Library |
| 인증 | 백엔드 Google OAuth2 + JWT (localStorage) |

---

## 3. 화면 구성 (와이어프레임 기준 6개 화면)

| # | 화면 | 경로 | 설명 |
|---|---|---|---|
| 1 | 로그인 | `/login` | Google OAuth 로그인 |
| 2 | 홈 (종목 목록) | `/` | 검색/필터, 종목 카드 리스트 |
| 3 | 종목 상세 | `/courses/[id]` | 가격, 시세 차트, 거래소별 비교 |
| 4 | 랭킹 | `/ranking` | 상승률/하락률, 기간 필터 |
| 5 | 관심 종목 | `/watchlist` | 찜 목록, 목표가 알림 토글 |
| 6 | 구독 플랜 | `/subscription` | 개인/법인 플랜, 토스 빌링 |

---

## 4. MVP 범위

### 포함
- Google OAuth2 로그인 (백엔드 리다이렉트 방식)
- JWT 토큰 저장 (localStorage) 및 API 요청 헤더 주입
- 종목 목록 조회 + 검색 + 카테고리 필터 (전체/골프/콘도/피트니스)
- 종목 상세 + 시세 차트 (1일/1주/1개월/3개월/1년)
- 거래소별 최신가 비교
- 관심 종목 추가/삭제 + 목표가 설정
- 알림 토글 (alertYn)
- 실시간 랭킹 (상승률/하락률, 기간별)
- 구독 플랜 선택 + 토스페이먼츠 빌링 연동
- 모바일 우선 반응형 레이아웃 (max-w-md 고정)
- 하단 탭 바 (홈/랭킹/관심/MY)

### 제외
- 회원 프로필 수정
- WebSocket 실시간 알림 UI (백엔드 연동은 Phase 2에서)
- 다크 모드
- PWA / 앱 설치 프롬프트
- 알림 내역 페이지 (`/alerts`)

---

## 5. 구현 Phase

### Phase 1 — 프로젝트 셋업 + 공통 인프라
- 의존성 설치 (recharts, lucide-react, swr)
- Jest + React Testing Library 설정
- 공통 타입 정의 (`lib/types.ts`)
- API 클라이언트 (`lib/api.ts`)
- 인증 유틸 (`lib/auth.ts`)
- 공통 컴포넌트: BottomTabBar, CourseCard, PriceTag
- (main) 레이아웃 + 루트 layout 수정

### Phase 2 — 로그인 + 인증 플로우
- `/login` 페이지
- OAuth2 콜백 처리 (`/auth/callback`)
- PrivateRoute 패턴 (미인증 시 로그인으로 리다이렉트)

### Phase 3 — 홈 + 종목 상세
- `/` 홈 (종목 목록 + 검색 + 필터)
- `/courses/[id]` 종목 상세 + 시세 차트 + 거래소 비교

### Phase 4 — 랭킹
- `/ranking` 상승률/하락률 탭 + 기간 필터 (1일/7일/30일/90일)

### Phase 5 — 관심 종목
- `/watchlist` 찜 목록 + 목표가 + 알림 토글

### Phase 6 — 구독 플랜
- `/subscription` 플랜 선택 + 토스페이먼츠 SDK 연동

---

## 6. API 연동 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/v1/courses` | 종목 목록 (검색/필터) |
| GET | `/api/v1/courses/{id}` | 종목 상세 |
| GET | `/api/v1/courses/{id}/price-history` | 시세 히스토리 |
| GET | `/api/v1/courses/{id}/sources` | 거래소별 최신가 |
| GET | `/api/v1/courses/ranking` | 랭킹 |
| GET | `/api/v1/watchlist` | 관심 종목 목록 |
| POST | `/api/v1/watchlist` | 관심 추가 |
| PUT | `/api/v1/watchlist/{id}` | 목표가/알림 수정 |
| DELETE | `/api/v1/watchlist/{id}` | 관심 삭제 |
| GET | `/api/v1/subscriptions/plans` | 구독 플랜 목록 |
| POST | `/api/v1/subscriptions/prepare` | 빌링 준비 |
| GET | `/api/v1/subscriptions/me` | 내 구독 정보 |

---

## 7. 인증 플로우

```
[프론트] "Google로 계속하기" 클릭
    ↓
[리다이렉트] GET /oauth2/authorization/google (백엔드)
    ↓
[Google] OAuth2 인증
    ↓
[백엔드] JWT 발급 → 프론트 /auth/callback?token=xxx 로 리다이렉트
    ↓
[프론트] localStorage.setItem("token", xxx) → / 로 이동
```

---

## 8. 테스트 전략

- 각 Phase마다 핵심 컴포넌트/페이지 단위 테스트 작성
- API 호출은 MSW (Mock Service Worker) 없이 jest.mock으로 처리
- 렌더링 + 인터랙션 (클릭, 입력) 위주 테스트
