const ONE_EOK = 100_000_000
const DOMAIN_STEP = 10_000_000

type PricePoint = {
  price: number
}

export type PriceChartDomain = [number, number] | ['auto', 'auto']

/**
 * 작은 가격 변동도 보이도록 1억원 구간을 기본 축 범위로 사용한다.
 * 실제 변동 폭이 1억원을 넘으면 데이터 바깥에 10% 여백을 둔다.
 */
export function calculatePriceChartDomain(
  history: readonly PricePoint[] | undefined,
): PriceChartDomain {
  const prices = (history ?? [])
    .map(({ price }) => price)
    .filter((price) => Number.isFinite(price) && price >= 0)

  if (prices.length === 0) return ['auto', 'auto']

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const spread = maxPrice - minPrice

  if (spread <= ONE_EOK) {
    const midpoint = (minPrice + maxPrice) / 2
    let lower = Math.max(
      0,
      Math.floor((midpoint - ONE_EOK / 2) / DOMAIN_STEP) * DOMAIN_STEP,
    )
    let upper = lower + ONE_EOK

    if (upper < maxPrice) {
      upper = Math.ceil(maxPrice / DOMAIN_STEP) * DOMAIN_STEP
      lower = Math.max(0, upper - ONE_EOK)
    }
    return [lower, upper]
  }

  const padding = Math.max(DOMAIN_STEP, spread * 0.1)
  const lower = Math.max(
    0,
    Math.floor((minPrice - padding) / DOMAIN_STEP) * DOMAIN_STEP,
  )
  const upper = Math.ceil((maxPrice + padding) / DOMAIN_STEP) * DOMAIN_STEP
  return [lower, upper]
}
