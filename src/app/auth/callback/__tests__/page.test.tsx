import { render, screen } from '@testing-library/react'
import AuthCallbackPage from '../page'

const mockReplace = jest.fn()
let mockParams: Record<string, string | null> = {}

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({ get: (key: string) => mockParams[key] ?? null }),
}))

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockParams = {}
    localStorage.clear()
  })

  it('로딩 중 텍스트를 렌더링한다', () => {
    render(<AuthCallbackPage />)
    expect(screen.getByText('로그인 처리 중...')).toBeInTheDocument()
  })

  it('success=true면 홈으로 이동한다', () => {
    mockParams = { success: 'true' }
    render(<AuthCallbackPage />)
    expect(mockReplace).toHaveBeenCalledWith('/home')
  })

  it('success가 없으면 로그인 페이지로 이동한다', () => {
    render(<AuthCallbackPage />)
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('URL에 token이 있어도 읽거나 저장하지 않는다 (fe#49/fe#50)', () => {
    // 백엔드가 전환기 동안 ?token=을 병행 발급하지만, 인증은 HttpOnly 쿠키로만 처리한다
    mockParams = { success: 'true', token: 'leaked-jwt-token' }
    render(<AuthCallbackPage />)

    expect(mockReplace).toHaveBeenCalledWith('/home')
    expect(localStorage.getItem('mf_token')).toBeNull()
    expect(localStorage.length).toBe(0)
  })
})
