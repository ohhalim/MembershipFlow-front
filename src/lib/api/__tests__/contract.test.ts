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

  it('region=null을 목록·랭킹·거래소 비교 계약으로 파싱한다', async () => {
    const nullableRegionCourse = {
      id: validDetail.id,
      name: validDetail.name,
      region: null,
      category: validDetail.category,
      membershipType: validDetail.membershipType,
      latestPrice: validDetail.latestPrice,
      changeRate: validDetail.changeRate,
      updatedAt: validDetail.updatedAt,
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({
        content: [nullableRegionCourse],
        last: true,
        totalElements: 1,
      }))
      .mockResolvedValueOnce(jsonResponse({
        content: [{
          rank: 1,
          courseId: 1,
          name: '88',
          region: null,
          currentPrice: 438_000_000,
          changeRate: 9.5,
        }],
        page: 0,
        size: 20,
        totalElements: 1,
        hasNext: false,
      }))
      .mockResolvedValueOnce(jsonResponse([{
        courseId: 1,
        name: '88',
        region: null,
        courseType: 'GOLF',
        prices: [{ sourceName: '동아', price: 438_000_000 }],
        minPrice: 438_000_000,
        maxPrice: 438_000_000,
        diffAmount: 0,
        diffRate: 0,
      }]))

    await expect(coursesApi.getList()).resolves.toMatchObject({
      content: [expect.objectContaining({ region: null })],
    })
    await expect(coursesApi.getRankingPage('rise', 7, 0)).resolves.toMatchObject({
      content: [expect.objectContaining({ region: null })],
    })
    await expect(coursesApi.getSourceComparison()).resolves.toEqual([
      expect.objectContaining({ region: null }),
    ])
    expect(warn).not.toHaveBeenCalled()
  })
})
