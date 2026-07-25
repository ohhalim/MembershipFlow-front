import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from '../useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('지연 시간이 지나기 전에는 이전 값을 유지한다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } },
    )

    rerender({ value: '송도CC' })
    act(() => jest.advanceTimersByTime(299))

    expect(result.current).toBe('')
  })

  it('마지막 입력 후 300ms가 지나면 최신 값을 반영한다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } },
    )

    rerender({ value: '송' })
    act(() => jest.advanceTimersByTime(200))
    rerender({ value: '송도CC' })
    act(() => jest.advanceTimersByTime(300))

    expect(result.current).toBe('송도CC')
  })
})
