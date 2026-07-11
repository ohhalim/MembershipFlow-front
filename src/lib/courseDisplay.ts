import { formatMembershipType, formatPriceCompact } from './utils'

export interface CourseDisplayName {
  title: string
  details: string[]
}

const PRODUCT_TOKEN_PATTERN =
  /(주중무기명|주중가족|주중개인|주중부부|복합주중|VVIP|VIP|우대|무기명|주중|가족|개인|부부|남자|여자|男|女|일반|주식|분담금|골드|로얄|프리미엄|프리미어|비즈니스|창립|하나로|빌리지)+$/

const PRODUCT_TOKEN_SCAN =
  /주중무기명|주중가족|주중개인|주중부부|복합주중|VVIP|VIP|우대|무기명|주중|가족|개인|부부|남자|여자|男|女|일반|주식|분담금|골드|로얄|프리미엄|프리미어|비즈니스|창립|하나로|빌리지/g

const PRODUCT_LABELS: Record<string, string> = {
  주중무기명: '주중 무기명',
  주중가족: '주중 가족',
  주중개인: '주중 개인',
  주중부부: '주중 부부',
  복합주중: '복합 주중',
  男: '남자',
  女: '여자',
}

function formatProductToken(token: string): string {
  return PRODUCT_LABELS[token] ?? token
}

function formatTier(rawAmount: string): string | null {
  const amountInTenThousands = Number(rawAmount.replaceAll(',', ''))
  if (!Number.isFinite(amountInTenThousands) || amountInTenThousands <= 0) return null
  return `분양가 ${formatPriceCompact(amountInTenThousands * 10_000)}`
}

function parseParenthetical(value: string): string[] | null {
  const numeric = value.match(/^([\d,]+)(?:-(\d+평))?$/)
  if (numeric) {
    const tier = formatTier(numeric[1])
    return tier ? [tier, ...(numeric[2] ? [numeric[2]] : [])] : null
  }

  const productWithTier = value.match(/^(VVIP|VIP|일반|무기명|男|女)-([\d,]+)$/)
  if (productWithTier) {
    const tier = formatTier(productWithTier[2])
    return [formatProductToken(productWithTier[1]), ...(tier ? [tier] : [])]
  }

  const familyCount = value.match(/^(가족|개인)(\d+명)$/)
  if (familyCount) return [`${familyCount[1]} ${familyCount[2]}`]

  if (/^(VVIP|VIP|골드|로얄|프리미엄|프리미어|비즈니스|원창립)$/.test(value)) {
    return [value]
  }

  return null
}

/**
 * API 식별명은 유지하고 화면에서만 골프장명과 회원권 상품 정보를 분리한다.
 * 알 수 없는 괄호(옛 이름, 지역, 영문 별칭)는 제목 일부로 보존한다.
 */
export function parseCourseDisplayName(rawName: string): CourseDisplayName {
  const original = rawName.trim()
  let title = original
  const details: string[] = []

  // 끝에 연속된 인식 가능 괄호만 분리한다. 예: (18000)(로얄)
  while (true) {
    const parenthetical = title.match(/\(([^()]*)\)$/)
    if (!parenthetical || parenthetical.index == null) break

    const parsed = parseParenthetical(parenthetical[1].trim())
    if (!parsed) break

    title = title.slice(0, parenthetical.index).trim()
    details.unshift(...parsed)
  }

  // 괄호 없이 이름 끝에 붙은 4~6자리 분양금 tier
  const trailingTier = title.match(/^(.*?)([\d,]{4,6})$/)
  if (trailingTier && trailingTier[1].trim()) {
    const tier = formatTier(trailingTier[2])
    if (tier) {
      title = trailingTier[1].trim()
      details.unshift(tier)
    }
  }

  const grade = title.match(/^(.*?)([A-Z]등급)$/)
  if (grade && grade[1].trim()) {
    title = grade[1].trim()
    details.unshift(grade[2])
  }

  const productSuffix = title.match(PRODUCT_TOKEN_PATTERN)
  if (productSuffix?.index != null && productSuffix.index > 0) {
    const tokens = productSuffix[0].match(PRODUCT_TOKEN_SCAN) ?? []
    title = title.slice(0, productSuffix.index).trim()
    details.unshift(...tokens.map(formatProductToken))
  }

  return {
    title: title || original,
    details: [...new Set(details)],
  }
}

export function courseDisplayTitle(rawName: string): string {
  return parseCourseDisplayName(rawName).title
}

export function courseDisplayMeta(
  rawName: string,
  region: string | null | undefined,
  membershipType: string | null | undefined,
): string[] {
  const { details } = parseCourseDisplayName(rawName)
  const membershipLabel = formatMembershipType(membershipType)
  const detailWords = details.flatMap((detail) => detail.split(' '))

  return [
    region ?? '',
    ...(membershipLabel && !detailWords.includes(membershipLabel) ? [membershipLabel] : []),
    ...details,
  ].filter((value, index, values) => value && values.indexOf(value) === index)
}
