import { calculatePriceChartDomain } from '../priceChart'

describe('calculatePriceChartDomain', () => {
  it('변동 폭이 작으면 가격 중심의 1억원 구간을 반환한다', () => {
    const domain = calculatePriceChartDomain([
      { price: 130_000_000 },
      { price: 150_000_000 },
    ])

    expect(domain).toEqual([90_000_000, 190_000_000])
  })

  it('단일 가격도 0원 기준이 아닌 1억원 구간으로 표시한다', () => {
    expect(calculatePriceChartDomain([{ price: 130_000_000 }]))
      .toEqual([80_000_000, 180_000_000])
  })

  it('변동 폭이 1억원을 넘으면 모든 데이터를 포함해 여백을 추가한다', () => {
    expect(calculatePriceChartDomain([
      { price: 100_000_000 },
      { price: 250_000_000 },
    ])).toEqual([80_000_000, 270_000_000])
  })

  it('가격 이력이 없으면 자동 범위를 사용한다', () => {
    expect(calculatePriceChartDomain([])).toEqual(['auto', 'auto'])
  })
})
