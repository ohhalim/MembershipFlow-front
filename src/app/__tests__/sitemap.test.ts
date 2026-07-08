export {}

const mockServerFetch = jest.fn()
jest.mock('@/lib/api/server', () => ({
  serverFetch: (...args: unknown[]) => mockServerFetch(...args),
}))

describe('sitemap', () => {
  beforeEach(() => {
    mockServerFetch.mockReset()
  })

  it('정적 페이지를 포함한다', async () => {
    mockServerFetch.mockResolvedValue({ content: [], last: true })
    const { default: sitemap } = await import('../sitemap')

    const result = await sitemap()

    expect(result.some((r) => r.url === 'https://membershipflow.site')).toBe(true)
    expect(result.some((r) => r.url === 'https://membershipflow.site/ranking')).toBe(true)
  })

  it('전체 코스 목록을 페이지네이션으로 순회해 sitemap에 포함한다', async () => {
    mockServerFetch
      .mockResolvedValueOnce({ content: [{ id: 1 }, { id: 2 }], last: false })
      .mockResolvedValueOnce({ content: [{ id: 3 }], last: true })
    const { default: sitemap } = await import('../sitemap')

    const result = await sitemap()

    expect(result.some((r) => r.url === 'https://membershipflow.site/courses/1')).toBe(true)
    expect(result.some((r) => r.url === 'https://membershipflow.site/courses/2')).toBe(true)
    expect(result.some((r) => r.url === 'https://membershipflow.site/courses/3')).toBe(true)
    expect(mockServerFetch).toHaveBeenCalledTimes(2)
  })

  it('백엔드 조회 실패 시에도 정적 페이지는 반환한다', async () => {
    mockServerFetch.mockRejectedValue(new Error('backend down'))
    const { default: sitemap } = await import('../sitemap')

    const result = await sitemap()

    expect(result.length).toBeGreaterThan(0)
    expect(result.some((r) => r.url.includes('/courses/'))).toBe(false)
  })
})
