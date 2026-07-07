import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 — MembershipFlow',
}

const SECTIONS = [
  {
    title: '제1조 (목적)',
    body: '본 약관은 MembershipFlow(이하 "서비스")가 제공하는 골프 회원권 시세 정보 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무를 규정함을 목적으로 합니다.',
  },
  {
    title: '제2조 (서비스의 내용)',
    body: '서비스는 국내 회원권 거래소에 공개된 시세 정보를 수집·가공하여 시세 조회, 차트, 랭킹, 목표가 알림 기능을 제공합니다. 유료 구독 시 전체 기간 차트 등 추가 기능이 제공됩니다.',
  },
  {
    title: '제3조 (시세 정보의 한계)',
    body: '서비스가 제공하는 시세는 각 거래소가 공개한 호가 정보를 기반으로 하며, 실제 거래 가격과 다를 수 있습니다. 시세 정보는 투자 판단의 참고 자료일 뿐이며, 서비스는 정보의 정확성·완전성을 보증하지 않고 이를 근거로 한 거래 결과에 대해 책임을 지지 않습니다.',
  },
  {
    title: '제4조 (회원 가입 및 계정)',
    body: '회원 가입은 Google 계정 연동으로 이루어집니다. 이용자는 본인의 계정을 타인에게 양도하거나 대여할 수 없습니다.',
  },
  {
    title: '제5조 (유료 구독)',
    body: '유료 구독은 결제일 기준 1개월 단위로 자동 갱신됩니다. 구독 해지는 언제든 가능하며, 해지 시 이미 결제된 기간이 종료될 때까지 구독 혜택이 유지됩니다.',
  },
  {
    title: '제6조 (서비스의 변경 및 중단)',
    body: '서비스는 운영상·기술상 필요에 따라 제공 내용을 변경하거나 중단할 수 있으며, 중대한 변경 시 사전에 공지합니다.',
  },
  {
    title: '제7조 (약관의 변경)',
    body: '본 약관은 관련 법령을 위반하지 않는 범위에서 개정될 수 있으며, 개정 시 서비스 내 공지합니다.',
  },
] as const

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-blue-500 hover:underline">← 돌아가기</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">이용약관</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2026년 7월 7일</p>

      <div className="space-y-6">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-sm font-bold text-gray-800 mb-1.5">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
