import { render, screen } from '@testing-library/react'
import { SideNav } from '../SideNav'

jest.mock('next/navigation', () => ({
  usePathname: () => '/home',
}))

jest.mock('@/components/notifications/NotificationBell', () => ({
  NotificationBell: () => <button type="button">알림</button>,
}))

describe('SideNav', () => {
  it('서비스 이름과 설명을 누르면 홈으로 이동한다', () => {
    render(<SideNav />)

    expect(
      screen.getByRole('link', { name: 'MembershipFlow 거래소별 시세 비교' }),
    ).toHaveAttribute('href', '/home')
  })

  it('알림을 메뉴 영역에 표시한다', () => {
    render(<SideNav />)

    expect(screen.getByRole('navigation')).toContainElement(
      screen.getByRole('button', { name: '알림' }),
    )
  })
})
