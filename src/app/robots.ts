import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://membershipflow.site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/my', '/watchlist', '/auth'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
