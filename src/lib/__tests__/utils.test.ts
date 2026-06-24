import { formatPrice, formatPriceCompact, formatChangeRate, changeRateColor, priceGap } from '../utils'

describe('formatPrice', () => {
  it('억 + 만원 형식으로 반환한다', () => {
    expect(formatPrice(250_000_000)).toBe('2억 5,000만원')
  })
  it('억 단위만 있을 때', () => {
    expect(formatPrice(200_000_000)).toBe('2억')
  })
  it('만원 단위만 있을 때', () => {
    expect(formatPrice(5_000_000)).toBe('500만원')
  })
})

describe('formatPriceCompact', () => {
  it('1억 이상은 소수점 1자리 억 단위', () => {
    expect(formatPriceCompact(250_000_000)).toBe('2.5억')
  })
  it('소수점이 .0이면 생략한다', () => {
    expect(formatPriceCompact(200_000_000)).toBe('2억')
  })
  it('1억 미만은 만원 단위', () => {
    expect(formatPriceCompact(9_000_000)).toBe('900만')
  })
})

describe('formatChangeRate', () => {
  it('양수는 ▲ 기호', () => {
    expect(formatChangeRate(2.5)).toBe('▲ 2.5%')
  })
  it('음수는 ▼ 기호', () => {
    expect(formatChangeRate(-1.2)).toBe('▼ 1.2%')
  })
  it('0은 기호 없음', () => {
    expect(formatChangeRate(0)).toBe('0.0%')
  })
})

describe('changeRateColor', () => {
  it('양수는 빨강', () => {
    expect(changeRateColor(1)).toBe('text-red-500')
  })
  it('음수는 파랑', () => {
    expect(changeRateColor(-1)).toBe('text-blue-500')
  })
  it('0은 회색', () => {
    expect(changeRateColor(0)).toBe('text-gray-400')
  })
})

describe('priceGap', () => {
  it('목표가가 현재가보다 낮으면 음수', () => {
    expect(priceGap(230_000_000, 250_000_000)).toBe(-8)
  })
  it('목표가가 현재가보다 높으면 양수', () => {
    expect(priceGap(270_000_000, 250_000_000)).toBe(8)
  })
})
