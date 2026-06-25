# MembershipFlow 프론트엔드 트러블슈팅 기록

개발 중 발생한 주요 프론트엔드 문제와 해결 과정을 기록합니다.

---

## 1. API 파라미터/필드 불일치

### 배경
홈 화면 골프장 목록이 빈 결과로 표시되거나 일부 필드가 undefined로 렌더링됨.

### 원인
`courses.ts` API 클라이언트의 파라미터 이름이 백엔드 스펙과 다름:
- `keyword` → 백엔드는 `q` 사용
- `category` → 백엔드는 `courseType` 사용
- 존재하지 않는 `sort` 파라미터를 전송

### 해결

```typescript
// Before
if (params.keyword) query.set('keyword', params.keyword)
if (params.category) query.set('category', params.category)
query.set('sort', params.sort)

// After
if (params.keyword) query.set('q', params.keyword)
if (params.category && params.category !== '전체') query.set('courseType', params.category)
// sort 파라미터 제거 (백엔드 미지원)
```

추가로 Spring Page 응답을 배열로 안전하게 추출:

```typescript
const res = await apiClient.get<{ content: Course[] } | Course[]>(...)
return Array.isArray(res) ? res : res.content
```

---

## 2. 관심종목 하트 버튼 onClick 미연결

### 배경
골프장 상세 페이지의 하트(♥) 버튼을 눌러도 아무 반응이 없음.

### 원인
`courses/[id]/page.tsx`에서 하트 버튼 컴포넌트에 `onClick` 핸들러가 없었음. `useWatchlist` 훅도 import되지 않은 상태였음.

### 해결

```tsx
const { data: watchlist, add: addWatch, remove: removeWatch } = useWatchlist()
const watchlistItem = watchlist?.find((w) => w.courseId === id)
const isWatched = !!watchlistItem

async function handleToggleWatchlist() {
  if (heartLoading) return
  setHeartLoading(true)
  try {
    if (isWatched) {
      await removeWatch(watchlistItem.id)
    } else {
      await addWatch({ courseId: id, targetPrice: null, alertYn: false })
    }
  } finally {
    setHeartLoading(false)
  }
}

// JSX
<button onClick={handleToggleWatchlist} disabled={heartLoading}>
  <Heart className={cn(isWatched ? 'fill-red-400 text-red-400' : 'text-gray-400')} />
</button>
```

---

## 3. 토스페이먼츠 successUrl localhost 참조

### 배경
구독 결제 시 `successUrl`이 `http://localhost:3000/api/v1/subscriptions/callback`으로 전송되어 프로덕션에서 404 발생 가능.

### 원인
`window.location.origin`을 사용해 현재 브라우저 origin을 기반으로 successUrl을 구성. 개발 환경에서는 로컬호스트가 그대로 적용됨.

### 해결

```typescript
// Before
successUrl: `${window.location.origin}/api/v1/subscriptions/callback`

// After
successUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscriptions/callback`
```

`NEXT_PUBLIC_API_URL`은 `.env.local`에서 설정. Next.js `NEXT_PUBLIC_*` 환경변수는 빌드/dev 서버 시작 시 번들에 포함되므로, 변경 시 서버 재시작 필요.

---

## 4. 인증 가드 레이스 컨디션

### 배경
미인증 사용자가 `/my/subscription` 등에 직접 접근 시, 로그인 페이지로 리다이렉트 전에 자식 컴포넌트의 API 호출(401)이 먼저 발생.

### 원인
`layout.tsx`에서 `useEffect` 내 인증 체크는 하이드레이션 이후에 실행되어, 자식 컴포넌트가 먼저 렌더링되어 SWR 요청을 시작함.

### 해결
`checked` 상태로 인증 완료 전 렌더 차단:

```tsx
const [checked, setChecked] = useState(false)

useEffect(() => {
  if (!auth.isAuthenticated()) {
    router.replace('/login')
  } else {
    setChecked(true)
  }
}, [router])

if (!checked) return null  // 인증 확인 전 자식 렌더 차단
```

---

## 5. useSearchParams Suspense 누락

### 배경
`/my/subscription?success=1` 접근 시 hydration 경고 또는 렌더 중단 발생.

### 원인
Next.js 14 App Router에서 `useSearchParams()`는 `<Suspense>` 경계가 없으면 SSR 단계에서 렌더링을 중단시킨다.

### 해결
실제 로직 컴포넌트를 분리해 Suspense로 감싸기:

```tsx
function SubscriptionPageContent() {
  const searchParams = useSearchParams()
  // ... 컴포넌트 내용
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionPageContent />
    </Suspense>
  )
}
```

`auth/callback/page.tsx`에서 이미 사용 중인 패턴.

---

## 6. SWR 401 무한 재시도

### 배경
구독/관심종목 API가 401을 반환할 때 SWR이 재시도를 반복하여 불필요한 네트워크 요청 발생.

### 원인
SWR 기본 `onErrorRetry` 전략은 에러 코드와 무관하게 재시도한다. 401은 재시도해도 결과가 바뀌지 않음.

### 해결

```typescript
useSWR(key, fetcher, {
  onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
    if (error?.status === 401 || error?.status === 404) return
    if (retryCount >= 2) return
    setTimeout(() => revalidate({ retryCount }), 3000)
  },
})
```

`useMySubscription`, `useWatchlist`에 적용.

---

## 7. NEXT_PUBLIC_* 환경변수 반영 안 됨

### 배경
`.env.local`에서 `NEXT_PUBLIC_API_URL` 값을 변경했는데 코드에 반영되지 않음.

### 원인
Next.js `NEXT_PUBLIC_*` 환경변수는 dev 서버 시작 시 번들에 번인(bake-in)된다. 런타임에 읽지 않으므로 값을 변경해도 재시작 전까지는 이전 값이 사용됨.

### 해결
`.env.local` 수정 후 반드시 `npm run dev` 재시작.
