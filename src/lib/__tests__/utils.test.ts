import { formatPrice, formatPriceCompact, formatChangeRate, changeRateColor, priceGap, formatMembershipType, daysSince, isStale, formatStaleness } from '../utils'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

describe('daysSince / isStale / formatStaleness', () => {
  it('daysSince는 경과 일수를 반환한다', () => {
    expect(daysSince(daysAgoIso(3))).toBe(3)
  })
  it('14일 미만이면 stale이 아니다', () => {
    expect(isStale(daysAgoIso(13))).toBe(false)
  })
  it('14일 이상이면 stale이다', () => {
    expect(isStale(daysAgoIso(14))).toBe(true)
  })
  it('오늘 갱신이면 "오늘 갱신"을 반환한다', () => {
    expect(formatStaleness(daysAgoIso(0))).toBe('오늘 갱신')
  })
  it('stale 아니면 "N일 전 갱신"을 반환한다', () => {
    expect(formatStaleness(daysAgoIso(5))).toBe('5일 전 갱신')
  })
  it('stale이면 "N일간 갱신 안됨"을 반환한다', () => {
    expect(formatStaleness(daysAgoIso(20))).toBe('20일간 갱신 안됨')
  })
})

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

describe('formatMembershipType', () => {
  it.each([
    ['REGULAR', '일반'],
    ['WEEKDAY', '주중'],
    ['WEEKEND', '주말'],
    ['FAMILY', '가족'],
    ['INDIVIDUAL', '개인'],
    ['CORPORATE', '법인'],
    ['SHAREHOLDER', '주주'],
    ['PREFERRED', '우대'],
    ['MALE', '남자'],
    ['FEMALE', '여자'],
  ])('%s → %s', (value, expected) => {
    expect(formatMembershipType(value)).toBe(expected)
  })

  it('미지의 값은 그대로 반환한다', () => {
    expect(formatMembershipType('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
  })

  it('null/undefined는 빈 문자열을 반환한다', () => {
    expect(formatMembershipType(null)).toBe('')
    expect(formatMembershipType(undefined)).toBe('')
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
