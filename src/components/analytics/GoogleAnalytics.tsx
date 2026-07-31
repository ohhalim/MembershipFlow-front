'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  GA_MEASUREMENT_ID,
  isAnalyticsEnabled,
  sendPageView,
} from '@/lib/analytics'

export function GoogleAnalytics() {
  const pathname = usePathname()
  const [tagLoaded, setTagLoaded] = useState(false)

  useEffect(() => {
    if (tagLoaded && pathname) {
      sendPageView(window.location.href)
    }
  }, [pathname, tagLoaded])

  if (!isAnalyticsEnabled || !GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => setTagLoaded(true)}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  )
}
