const STALE_THRESHOLD_DAYS = 14

/**
 * 마지막 갱신 시각으로부터 경과 일수. 갱신일이 오래될수록 "협상 여지가 있을 수 있다"는
 * 신호가 되므로(거래소 시세표가 실제로는 자주 안 바뀜) 상세 페이지에서 노출한다.
 */
export function daysSince(isoDateTime: string): number {
  const diffMs = Date.now() - new Date(isoDateTime).getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

/** STALE_THRESHOLD_DAYS(14일) 이상 갱신 안 됐으면 true */
export function isStale(isoDateTime: string): boolean {
  return daysSince(isoDateTime) >= STALE_THRESHOLD_DAYS
}

/**
 * 갱신 경과일을 사람이 읽기 좋은 문구로 변환
 * @example formatStaleness('2026-07-08T...') → "1일 전 갱신" 또는 "14일간 갱신 안됨"
 */
export function formatStaleness(isoDateTime: string): string {
  const days = daysSince(isoDateTime)
  if (days === 0) return '오늘 갱신'
  if (isStale(isoDateTime)) return `${days}일간 갱신 안됨`
  return `${days}일 전 갱신`
}

/**
 * 숫자를 한국 억/만원 형식으로 변환
 * @example formatPrice(250000000) → "2억 5,000만원"
 */
export function formatPrice(price: number): string {
  const eok = Math.floor(price / 100_000_000)
  const manwon = Math.floor((price % 100_000_000) / 10_000)

  if (eok > 0 && manwon > 0) return `${eok}억 ${manwon.toLocaleString()}만원`
  if (eok > 0) return `${eok}억`
  return `${manwon.toLocaleString()}만원`
}

/**
 * 숫자를 간략한 억 단위로 변환 (목록용)
 * @example formatPriceCompact(250000000) → "2.5억"
 */
export function formatPriceCompact(price: number): string {
  const eok = price / 100_000_000
  if (eok >= 1) {
    const fixed = eok.toFixed(1)
    return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}억`
  }
  return `${Math.floor(price / 10_000).toLocaleString()}만`
}

/**
 * 등락률을 기호 포함 문자열로 변환
 * @example formatChangeRate(2.5) → "▲ 2.5%"
 * @example formatChangeRate(-1.2) → "▼ 1.2%"
 */
export function formatChangeRate(rate: number): string {
  if (rate > 0) return `▲ ${rate.toFixed(1)}%`
  if (rate < 0) return `▼ ${Math.abs(rate).toFixed(1)}%`
  return '0.0%'
}

/**
 * 등락률 방향에 따른 Tailwind 색상 클래스 반환
 * 한국 주식 관례: 상승 = 빨강, 하락 = 파랑
 */
export function changeRateColor(rate: number): string {
  if (rate > 0) return 'text-red-500'
  if (rate < 0) return 'text-blue-500'
  return 'text-gray-400'
}

/**
 * 목표가 대비 현재가 차이 비율 계산
 * @example priceGap(230000000, 250000000) → -8 (목표가까지 -8%)
 */
export function priceGap(targetPrice: number, currentPrice: number): number {
  return Math.round(((targetPrice - currentPrice) / currentPrice) * 100)
}

const CATEGORY_LABEL: Record<string, string> = {
  GOLF: '골프',
  CONDO: '콘도',
  FITNESS: '피트니스',
}

const MEMBERSHIP_LABEL: Record<string, string> = {
  REGULAR: '일반',
  WEEKDAY: '주중',
  WEEKEND: '주말',
  FAMILY: '가족',
  INDIVIDUAL: '개인',
  CORPORATE: '법인',
  SHAREHOLDER: '주주',
  PREFERRED: '우대',
  MALE: '남자',
  FEMALE: '여자',
}

export function formatCategory(value: string | null | undefined): string {
  return value ? (CATEGORY_LABEL[value] ?? value) : ''
}

export function formatMembershipType(value: string | null | undefined): string {
  return value ? (MEMBERSHIP_LABEL[value] ?? value) : ''
}
