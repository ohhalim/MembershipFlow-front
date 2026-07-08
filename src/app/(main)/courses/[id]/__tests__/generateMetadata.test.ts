export {}

const mockServerFetch = jest.fn()
jest.mock('@/lib/api/server', () => ({
  serverFetch: (...args: unknown[]) => mockServerFetch(...args),
}))

describe('CourseDetailPage generateMetadata', () => {
  beforeEach(() => {
    mockServerFetch.mockReset()
  })

  it('코스명·가격 기반 title/description을 생성한다', async () => {
    mockServerFetch.mockResolvedValue({
      id: 2, name: '가야', region: '경남', category: 'GOLF',
      membershipType: 'PREFERRED', latestPrice: 147_000_000, changeRate: null,
      updatedAt: '2026-07-08', sources: [],
    })
    const { generateMetadata } = await import('../page')

    const metadata = await generateMetadata({ params: Promise.resolve({ id: '2' }) })

    expect(metadata.title).toBe('가야 회원권 시세 — 1.5억')
    expect(metadata.description).toContain('가야')
    expect(metadata.description).toContain('1.5억')
  })

  it('info.address가 있으면 description 앞에 지역을 붙인다', async () => {
    mockServerFetch.mockResolvedValue({
      id: 2, name: '가야', region: '경남', category: 'GOLF',
      membershipType: 'PREFERRED', latestPrice: 147_000_000, changeRate: null,
      updatedAt: '2026-07-08', sources: [],
      info: { address: '경기도 용인시 기흥구 석성로521번길 169' },
    })
    const { generateMetadata } = await import('../page')

    const metadata = await generateMetadata({ params: Promise.resolve({ id: '2' }) })

    expect(metadata.description).toMatch(/^경기도 용인시 · 가야/)
  })

  it('info가 없으면 description에 지역 접두어를 붙이지 않는다', async () => {
    mockServerFetch.mockResolvedValue({
      id: 2, name: '가야', region: '경남', category: 'GOLF',
      membershipType: 'PREFERRED', latestPrice: 147_000_000, changeRate: null,
      updatedAt: '2026-07-08', sources: [], info: null,
    })
    const { generateMetadata } = await import('../page')

    const metadata = await generateMetadata({ params: Promise.resolve({ id: '2' }) })

    expect(metadata.description).toMatch(/^가야/)
  })

  it('백엔드 조회 실패 시 폴백 메타데이터를 반환한다', async () => {
    mockServerFetch.mockRejectedValue(new Error('not found'))
    const { generateMetadata } = await import('../page')

    const metadata = await generateMetadata({ params: Promise.resolve({ id: '999' }) })

    expect(metadata.title).toBe('회원권 시세')
  })
})
