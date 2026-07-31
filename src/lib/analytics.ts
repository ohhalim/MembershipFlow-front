const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/

export const GA_MEASUREMENT_ID =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    : undefined

export function isValidMeasurementId(measurementId?: string): boolean {
  return Boolean(measurementId && MEASUREMENT_ID_PATTERN.test(measurementId))
}

export const isAnalyticsEnabled = isValidMeasurementId(GA_MEASUREMENT_ID)

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: Gtag
  }
}

export function sendPageView(url: string): void {
  if (!isAnalyticsEnabled || typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: url,
  })
}
