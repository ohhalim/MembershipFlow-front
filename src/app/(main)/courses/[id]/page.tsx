import type { Metadata } from 'next'
import { serverFetch } from '@/lib/api/server'
import { formatPriceCompact, formatCategory } from '@/lib/utils'
import type { CourseDetail } from '@/lib/types'
import { CourseDetailClient } from './CourseDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const course = await serverFetch<CourseDetail>(`/api/v1/courses/${id}`)
    const priceText = course.latestPrice != null ? formatPriceCompact(course.latestPrice) : '시세 문의'
    const title = `${course.name} 회원권 시세 — ${priceText}`
    const category = formatCategory(course.category)
    const description = `${course.name}${category ? ` ${category}` : ''} 회원권 최신 시세 ${priceText}. `
      + `동아골프·동부회원권 등 거래소별 가격 비교와 시세 차트를 MembershipFlow에서 확인하세요.`

    return {
      title,
      description,
      openGraph: { title, description },
    }
  } catch {
    // 코스 미존재/백엔드 장애 시에도 페이지 자체는 렌더링되도록 폴백 메타데이터만 반환
    return { title: '회원권 시세' }
  }
}

export default function CourseDetailPage() {
  return <CourseDetailClient />
}
