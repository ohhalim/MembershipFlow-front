import type { MetadataRoute } from 'next'
import { serverFetch } from '@/lib/api/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://membershipflow.site'

// 도커 빌드 시점엔 backend 컨테이너가 없어 코스 목록 fetch가 실패한다.
// 기본 캐싱(빌드 시점 스냅샷 고정)을 쓰면 그 실패 상태가 그대로 굳어버리므로
// 매 요청마다 새로 생성하도록 강제한다 (요청량이 크롤러뿐이라 부담 적음)
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/home`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/ranking`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
  ]

  let courseRoutes: MetadataRoute.Sitemap = []
  try {
    const ids = await fetchAllCourseIds()
    courseRoutes = ids.map((id) => ({
      url: `${SITE_URL}/courses/${id}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  } catch {
    // 백엔드 장애 시에도 정적 페이지는 반환 — sitemap 전체가 깨지면 안 됨
  }

  return [...staticRoutes, ...courseRoutes]
}

async function fetchAllCourseIds(): Promise<number[]> {
  const ids: number[] = []
  let page = 0
  const size = 100
  // 안전장치: 백엔드 응답이 예상과 다르게 last=false를 반복해도 무한루프 방지
  for (let guard = 0; guard < 100; guard++) {
    const res = await serverFetch<{ content: { id: number }[]; last: boolean }>(
      `/api/v1/courses?page=${page}&size=${size}`,
    )
    ids.push(...res.content.map((c) => c.id))
    if (res.last) break
    page++
  }
  return ids
}
