import { courseDisplayMeta, courseDisplayTitle, parseCourseDisplayName } from '../courseDisplay'

describe('parseCourseDisplayName', () => {
  it.each([
    ['휘닉스파크(8500)', '휘닉스파크', ['분양가 8,500만']],
    ['오펠(14,000)', '오펠', ['분양가 1.4억']],
    ['에딘버러주중가족', '에딘버러', ['주중 가족']],
    ['에딘버러주중개인', '에딘버러', ['주중 개인']],
    ['웰리힐리VIP50000', '웰리힐리', ['VIP', '분양가 5억']],
    ['동부산VVIP(30000)', '동부산', ['VVIP', '분양가 3억']],
    ['용평(가족2명)', '용평', ['가족 2명']],
    ['에덴밸리(VIP-50000)', '에덴밸리', ['VIP', '분양가 5억']],
    ['설악썬밸리(7600-32평)', '설악썬밸리', ['분양가 7,600만', '32평']],
    ['에스파크A등급(30000)', '에스파크', ['A등급', '분양가 3억']],
  ])('%s의 제목과 상품 정보를 분리한다', (raw, title, details) => {
    expect(parseCourseDisplayName(raw)).toEqual({ title, details })
  })

  it.each([
    '에이치원클럽(舊덕평)',
    '블랙스톤(제주)',
    '덕평cc(H1CLUB)',
    '포라이즌(舊승주)',
  ])('알 수 없는 별칭 괄호는 제목에 보존한다: %s', (raw) => {
    expect(parseCourseDisplayName(raw)).toEqual({ title: raw, details: [] })
  })

  it('상품명 자체가 전체 이름이면 빈 제목으로 만들지 않는다', () => {
    expect(courseDisplayTitle('골드')).toBe('골드')
  })

  it('지역이 없으면 앞쪽 구분점을 만들지 않고 중복 회원 유형을 제거한다', () => {
    expect(courseDisplayMeta('에딘버러주중가족', null, 'WEEKDAY'))
      .toEqual(['주중 가족'])
  })

  it('숫자 tier는 단위가 있는 보조정보로 표시한다', () => {
    expect(courseDisplayMeta('휘닉스파크(8500)', null, 'REGULAR'))
      .toEqual(['일반', '분양가 8,500만'])
  })
})
