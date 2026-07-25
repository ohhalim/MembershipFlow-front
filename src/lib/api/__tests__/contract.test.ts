import { ApiContractError } from '../contract'
import { coursesApi } from '../courses'

const validDetail = {
  id: 1,
  name: '88',
  region: '경기',
  category: 'GOLF',
  membershipType: 'REGULAR',
  latestPrice: 438_000_000,
  changeRate: 9.5,
  updatedAt: '2026-07-25T07:00:00',
  sources: [],
  info: null,
}

describe('API response contract', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => warn.mockRestore())

  function jsonResponse(body: unknown): Response {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => body,
    } as Response
  }

  it('백엔드 DTO 필드가 누락되면 명시적 계약 오류를 발생시킨다', async () => {
    const invalidDetail = { ...validDetail, latestPrice: undefined }
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(invalidDetail))

    await expect(coursesApi.getDetail(1)).rejects.toBeInstanceOf(ApiContractError)
    expect(warn).toHaveBeenCalledWith(
      'API response contract mismatch',
      expect.objectContaining({ context: '/api/v1/courses/1' }),
    )
  })

  it('백엔드 DTO가 스키마와 일치하면 파싱된 값을 반환한다', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(validDetail))

    await expect(coursesApi.getDetail(1)).resolves.toEqual(validDetail)
    expect(warn).not.toHaveBeenCalled()
  })
})
