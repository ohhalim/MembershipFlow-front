// 서버 컴포넌트(sitemap, generateMetadata) 전용 fetch 헬퍼.
// 브라우저는 nginx가 같은 오리진으로 /api를 프록시하지만, Next 서버 프로세스는
// 브라우저가 아니라서 상대경로를 못 쓰고 backend 컨테이너에 내부망으로 직접 붙는다.
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function serverFetch<T>(path: string, revalidateSeconds = 3600): Promise<T> {
  const res = await fetch(`${INTERNAL_API_URL}${path}`, { next: { revalidate: revalidateSeconds } })
  if (!res.ok) {
    throw new Error(`serverFetch 실패: ${path} (${res.status})`)
  }
  return res.json() as Promise<T>
}
