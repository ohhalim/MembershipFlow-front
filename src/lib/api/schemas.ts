import { z } from 'zod'

const nullableText = z.string().nullable()

export const courseSourcePriceSchema = z.object({
  source: z.string(),
  price: z.number(),
})

export const courseSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: nullableText,
  category: z.enum(['GOLF', 'CONDO', 'FITNESS']),
  membershipType: z.string(),
  latestPrice: z.number().nullable(),
  changeRate: z.number().nullable(),
  updatedAt: nullableText,
  sourcePrices: z.array(courseSourcePriceSchema).optional(),
})

const greenFeeSchema = z.object({
  grade: nullableText,
  weekday: z.number().nullable(),
  weekend: z.number().nullable(),
})

const courseInfoSchema = z.object({
  address: nullableText.optional(),
  membershipIntro: nullableText.optional(),
  courseIntro: nullableText.optional(),
  priceOutlook: nullableText.optional(),
  greenFees: z.array(greenFeeSchema).nullable().optional(),
  caddieFee: nullableText.optional(),
  cartFee: nullableText.optional(),
})

const sourcePriceSchema = z.object({
  sourceName: z.string(),
  sourceUrl: z.string().nullable().optional(),
  price: z.number(),
  updatedAt: z.string(),
  isLowest: z.boolean(),
})

export const courseDetailSchema = courseSchema.extend({
  sources: z.array(sourcePriceSchema),
  info: courseInfoSchema.nullable().optional(),
})

export const courseListPageSchema = z.object({
  content: z.array(courseSchema),
  last: z.boolean(),
  totalElements: z.number(),
})

export const courseIdPageSchema = z.object({
  content: z.array(z.object({ id: z.number() })),
  last: z.boolean(),
})

export const priceChartSchema = z.object({
  interval: z.string(),
  from: z.string(),
  to: z.string(),
  points: z.array(z.object({
    date: z.string(),
    avgPrice: z.number(),
    minPrice: z.number(),
  })),
  subscriptionRequired: z.boolean(),
})

export const sourceComparisonSchema = z.array(z.object({
  courseId: z.number(),
  name: z.string(),
  region: nullableText,
  courseType: nullableText,
  prices: z.array(z.object({ sourceName: z.string(), price: z.number() })),
  minPrice: z.number(),
  maxPrice: z.number(),
  diffAmount: z.number(),
  diffRate: z.number(),
}))

export const marketSummarySchema = z.object({
  updatedToday: z.number(),
  risers: z.number(),
  fallers: z.number(),
  comparedCourses: z.number().optional(),
  maxSpreadRate: z.number().optional(),
})

export const rankingPageSchema = z.object({
  content: z.array(z.object({
    rank: z.number(),
    courseId: z.number(),
    name: z.string(),
    region: nullableText,
    currentPrice: z.number(),
    changeRate: z.number(),
  })),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  hasNext: z.boolean(),
})

export const watchlistItemSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  courseName: z.string(),
  region: nullableText,
  targetPrice: z.number().nullable(),
  alertYn: z.boolean(),
  latestPrice: z.number().nullable(),
  createdAt: z.string(),
})

export const alertSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  courseName: z.string(),
  triggeredPrice: z.number(),
  targetPrice: z.number(),
  sourceName: z.string(),
  sentAt: z.string(),
  readAt: nullableText,
})

export const subscriptionPlanSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
})

export const billingPrepareSchema = z.object({
  customerKey: z.string(),
  clientKey: z.string(),
  planId: z.number(),
})

export const mySubscriptionSchema = z.object({
  id: z.number(),
  plan: z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    price: z.number(),
  }),
  status: z.enum(['ACTIVE', 'CANCELLED', 'SUSPENDED', 'PAYMENT_FAILED']),
  serviceActive: z.boolean(),
  serviceEndsAt: nullableText,
  startedAt: z.string(),
  nextBillingAt: nullableText,
  cardNumberMasked: nullableText,
  cardCompany: nullableText,
  cancelledAt: nullableText,
})

export const cancelResponseSchema = z.object({
  id: z.number(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'SUSPENDED', 'PAYMENT_FAILED']),
  cancelledAt: z.string(),
  serviceEndsAt: z.string(),
})

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
})
