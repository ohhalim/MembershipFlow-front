import type { ZodType } from 'zod'

export class ApiContractError extends Error {
  constructor(
    public readonly context: string,
    public readonly issues: string[],
  ) {
    super(`API 응답 계약 불일치: ${context}`)
    this.name = 'ApiContractError'
  }
}

export function parseApiResponse<T>(data: unknown, schema: ZodType<T>, context: string): T {
  const result = schema.safeParse(data)
  if (result.success) return result.data

  const issues = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    return `${path}: ${issue.message}`
  })
  console.warn('API response contract mismatch', { context, issues })
  throw new ApiContractError(context, issues)
}
