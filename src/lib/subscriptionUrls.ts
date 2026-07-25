const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export function resolveSubscriptionCallbackUrl(frontendOrigin: string): string {
  const baseUrl = (API_URL || frontendOrigin).replace(/\/$/, '')
  return `${baseUrl}/api/v1/subscriptions/callback`
}
