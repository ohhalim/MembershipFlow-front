import { expect, test, type Page } from '@playwright/test'

const listItem = {
  id: 1,
  name: '88',
  region: '경기',
  category: 'GOLF',
  membershipType: 'REGULAR',
  holes: 18,
  latestPrice: 438_000_000,
  updatedAt: '2026-07-25T07:00:00',
  changeRate: 9.5,
  sourcePrices: [
    { source: '동아골프', price: 450_000_000 },
    { source: '동부회원권', price: 438_000_000 },
  ],
}

const detail = {
  ...listItem,
  sources: [
    {
      sourceName: '동아골프',
      sourceUrl: 'https://example.com/donga',
      price: 450_000_000,
      updatedAt: '2026-07-25T07:00:00',
      isLowest: false,
    },
    {
      sourceName: '동부회원권',
      sourceUrl: 'https://example.com/dongbu',
      price: 438_000_000,
      updatedAt: '2026-07-25T07:00:00',
      isLowest: true,
    },
  ],
  watchlisted: false,
  targetPrice: null,
  info: null,
}

async function mockApi(page: Page, authenticated = true) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (path === '/api/v1/auth/me') {
      await route.fulfill(authenticated
        ? { json: { id: 1, email: 'test@example.com', name: '테스터' } }
        : { status: 401, json: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } })
      return
    }
    if (path === '/api/v1/auth/refresh') {
      await route.fulfill({ status: 401, json: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } })
      return
    }
    if (path === '/api/v1/courses/summary') {
      await route.fulfill({ json: { updatedToday: 1, risers: 1, fallers: 0, comparedCourses: 1, maxSpreadRate: 2.74 } })
      return
    }
    if (path === '/api/v1/courses/source-comparison') {
      await route.fulfill({ json: [] })
      return
    }
    if (path === '/api/v1/courses/ranking') {
      await route.fulfill({ json: { content: [], page: 0, size: 20, totalElements: 0, hasNext: false } })
      return
    }
    if (path === '/api/v1/courses/1/prices') {
      await route.fulfill({ json: {
        courseId: 1,
        courseName: '88',
        interval: 'DAY',
        from: '2026-06-25',
        to: '2026-07-25',
        points: [{ date: '2026-07-25', avgPrice: 438_000_000 }],
        summary: {},
        subscriptionRequired: false,
      } })
      return
    }
    if (path === '/api/v1/courses/1') {
      await route.fulfill({ json: detail })
      return
    }
    if (path === '/api/v1/courses') {
      await route.fulfill({ json: {
        content: [listItem],
        last: true,
        totalElements: 1,
      } })
      return
    }
    if (path === '/api/v1/watchlist') {
      await route.fulfill({ json: [] })
      return
    }

    await route.fulfill({ status: 404, json: { code: 'NOT_FOUND', message: 'mock 없음' } })
  })
}

test('홈에서 종목 목록과 대표 가격을 표시한다', async ({ page }) => {
  await mockApi(page)
  await page.goto('/home')

  await expect(page.getByText('88', { exact: true })).toBeVisible()
  await expect(page.getByText('4.4억', { exact: true }).first()).toBeVisible()
})

test('종목 상세에서 대표 가격과 거래소별 시세를 표시한다', async ({ page }) => {
  await mockApi(page)
  await page.goto('/courses/1')

  await expect(page.getByText('4억 3,800만원').first()).toBeVisible()
  await expect(page.getByText('동아골프')).toBeVisible()
  await expect(page.getByText('동부회원권')).toBeVisible()
  await expect(page.getByText('최저')).toBeVisible()
})

test('로그인 페이지에서 Google 로그인 진입점을 표시한다', async ({ page }) => {
  await mockApi(page, false)
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'MembershipFlow' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeVisible()
})
