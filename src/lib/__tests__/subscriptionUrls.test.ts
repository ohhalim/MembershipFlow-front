describe('resolveSubscriptionCallbackUrl', () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL

  afterEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl
  })

  it('로컬 API URL이 있으면 백엔드 origin으로 콜백한다', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8081'
    const { resolveSubscriptionCallbackUrl } = await import('../subscriptionUrls')

    expect(resolveSubscriptionCallbackUrl('http://localhost:3000')).toBe(
      'http://localhost:8081/api/v1/subscriptions/callback',
    )
  })

  it('API URL이 비어 있으면 프로덕션의 같은 origin을 사용한다', async () => {
    process.env.NEXT_PUBLIC_API_URL = ''
    const { resolveSubscriptionCallbackUrl } = await import('../subscriptionUrls')

    expect(resolveSubscriptionCallbackUrl('https://membershipflow.site')).toBe(
      'https://membershipflow.site/api/v1/subscriptions/callback',
    )
  })
})
