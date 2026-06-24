import { render, screen } from '@testing-library/react'
import AuthCallbackPage from '../page'

const mockReplace = jest.fn()
let mockToken: string | null = 'test-jwt-token'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({ get: (key: string) => (key === 'token' ? mockToken : null) }),
}))

const mockSetToken = jest.fn()
jest.mock('@/lib/auth', () => ({
  auth: { setToken: (t: string) => mockSetToken(t) },
}))

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockSetToken.mockClear()
    mockToken = 'test-jwt-token'
  })

  it('로딩 중 텍스트를 렌더링한다', () => {
    render(<AuthCallbackPage />)
    expect(screen.getByText('로그인 처리 중...')).toBeInTheDocument()
  })

  it('token이 있으면 저장 후 홈으로 이동한다', () => {
    render(<AuthCallbackPage />)
    expect(mockSetToken).toHaveBeenCalledWith('test-jwt-token')
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('token이 없으면 로그인 페이지로 이동한다', () => {
    mockToken = null
    render(<AuthCallbackPage />)
    expect(mockSetToken).not.toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })
})
