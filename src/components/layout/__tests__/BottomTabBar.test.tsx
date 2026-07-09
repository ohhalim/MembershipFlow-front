import { render, screen } from '@testing-library/react'
import { BottomTabBar } from '../BottomTabBar'

jest.mock('next/navigation', () => ({
  usePathname: () => '/home',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

describe('BottomTabBar', () => {
  it('4개 탭과 알림 벨을 렌더링한다', () => {
    render(<BottomTabBar />)
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('랭킹')).toBeInTheDocument()
    expect(screen.getByText('관심')).toBeInTheDocument()
    expect(screen.getByText('MY')).toBeInTheDocument()
    expect(screen.getByLabelText('알림')).toBeInTheDocument()
  })

  it('현재 경로(/home)에서 홈 탭이 활성 색상을 가진다', () => {
    render(<BottomTabBar />)
    const homeLink = screen.getByText('홈').closest('a')
    expect(homeLink).toHaveClass('text-blue-500')
  })

  it('각 탭은 올바른 href를 가진다', () => {
    render(<BottomTabBar />)
    expect(screen.getByText('랭킹').closest('a')).toHaveAttribute('href', '/ranking')
    expect(screen.getByText('관심').closest('a')).toHaveAttribute('href', '/watchlist')
    expect(screen.getByText('MY').closest('a')).toHaveAttribute('href', '/my')
  })
})
