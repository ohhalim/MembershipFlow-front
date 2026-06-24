import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('텍스트를 렌더링한다', () => {
    render(<Button>카드 등록</Button>)
    expect(screen.getByRole('button', { name: '카드 등록' })).toBeInTheDocument()
  })

  it('클릭 이벤트를 호출한다', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>클릭</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서는 클릭되지 않는다', async () => {
    const onClick = jest.fn()
    render(<Button disabled onClick={onClick}>클릭</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('fullWidth 설정 시 w-full 클래스가 적용된다', () => {
    render(<Button fullWidth>전체 너비</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})
