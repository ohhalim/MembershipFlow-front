import robots from '../robots'

describe('robots', () => {
  it('비공개 라우트를 disallow하고 sitemap 경로를 포함한다', () => {
    const result = robots()

    expect(result.rules).toEqual(
      expect.objectContaining({
        userAgent: '*',
        allow: '/',
        disallow: expect.arrayContaining(['/my', '/watchlist', '/auth']),
      }),
    )
    expect(result.sitemap).toBe('https://membershipflow.site/sitemap.xml')
  })
})
