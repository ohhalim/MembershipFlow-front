// ─── Domain Types ────────────────────────────────────────────────────────────

export type CourseCategory = 'GOLF' | 'CONDO' | 'FITNESS'

export interface Course {
  id: number
  name: string
  region: string
  category: CourseCategory
  membershipType: string
  latestPrice: number | null
  changeRate: number | null  // percentage (+ 상승 / - 하락)
  updatedAt: string
  sourcePrices?: CourseSourcePrice[]  // 거래소별 최신가
}

export interface CourseSourcePrice {
  source: string
  price: number
}

export interface MarketSummary {
  updatedToday: number
  risers: number
  fallers: number
}

export interface CourseDetail extends Course {
  sources: SourcePrice[]
  info?: CourseInfo | null
}

export interface GreenFee {
  grade: string | null
  weekday: number | null
  weekend: number | null
}

export interface CourseInfo {
  address?: string | null
  membershipIntro?: string | null
  courseIntro?: string | null
  priceOutlook?: string | null
  greenFees?: GreenFee[] | null
  caddieFee?: string | null
  cartFee?: string | null
}

export interface SourcePrice {
  sourceName: string
  price: number
  updatedAt: string
  isLowest: boolean
  sourceUrl?: string
}

export interface PricePoint {
  date: string
  price: number
}

export type ChartPeriod = '1d' | '1w' | '1m' | '3m' | '1y'

// ─── Ranking ─────────────────────────────────────────────────────────────────

export type RankingType = 'rise' | 'fall'
export type RankingPeriod = 1 | 7 | 30 | 90

export interface RankingItem {
  rank: number
  courseId: number
  courseName: string
  region: string
  latestPrice: number
  changeRate: number
}

// ─── Source Comparison ───────────────────────────────────────────────────────

export interface SourceComparisonItem {
  courseId: number
  name: string
  region: string
  courseType: string | null
  dongaPrice: number
  dongbuPrice: number
  diffAmount: number
  diffRate: number
}

// ─── Watchlist ───────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: number
  courseId: number
  courseName: string
  region: string
  targetPrice: number | null
  alertYn: boolean
  latestPrice: number
  createdAt: string
}

export interface WatchlistAddRequest {
  courseId: number
  targetPrice: number | null
  alertYn: boolean
}

export interface WatchlistUpdateRequest {
  targetPrice: number | null
  alertYn: boolean
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: number
  code: string
  name: string
  price: number
  description: string
}

export interface BillingPrepareResponse {
  customerKey: string
  clientKey: string
  planId: number
}

export interface MySubscription {
  id: number
  plan: { id: number; code: string; name: string; price: number }
  status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'PAYMENT_FAILED'
  startedAt: string
  nextBillingAt: string
  cardNumberMasked: string | null
  cardCompany: string | null
  cancelledAt: string | null
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  code: string
  message: string
  status: number
}
