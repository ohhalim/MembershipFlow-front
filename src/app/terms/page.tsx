import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 — MembershipFlow',
  alternates: { canonical: '/terms' },
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
    body: '유료 구독은 월간 또는 연간 플랜으로 제공됩니다. 결제를 완료하면 선택한 플랜 금액이 즉시 최초 결제되며, 이후 최초 결제일을 기준으로 선택한 월간 또는 연간 주기에 따라 자동 갱신됩니다. 결제 전 상품, 결제 금액, 적용 세금, 통화와 갱신 주기를 Paddle Checkout에서 확인할 수 있습니다.',
  },
  {
    title: '제6조 (결제 주체)',
    body: 'Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. Paddle은 유료 구독의 판매·결제 주체(Merchant of Record)로서 결제 처리, 세금, 영수증과 환불을 담당합니다. MembershipFlow는 카드번호 등 민감한 결제 정보를 직접 저장하지 않습니다.',
  },
  {
    title: '제7조 (구독 해지 및 환불)',
    body: '구독은 다음 결제일 전까지 언제든 해지할 수 있습니다. 해지하면 다음 자동결제가 중단되고, 이미 결제된 이용 기간이 끝날 때까지 구독 혜택이 유지됩니다. 환불과 법정 청약철회는 별도의 환불정책 및 Paddle Buyer Terms에 따라 처리되며, 관련 법령에서 보장하는 이용자의 권리를 제한하지 않습니다.',
  },
  {
    title: '제8조 (서비스의 변경 및 중단)',
    body: '서비스는 운영상·기술상 필요에 따라 제공 내용을 변경하거나 중단할 수 있으며, 중대한 변경 시 사전에 공지합니다.',
  },
  {
    title: '제9조 (약관의 변경)',
    body: '본 약관은 관련 법령을 위반하지 않는 범위에서 개정될 수 있으며, 개정 시 서비스 내 공지합니다.',
  },
  {
    title: '제10조 (사업자 및 고객지원)',
    body: '사업자명: 멤버쉽플로우 · 대표자: 오하림 · 고객지원 이메일: ohhalim777@gmail.com · 고객지원 전화: 010-7107-0766. 상품 이용 문의는 MembershipFlow 고객지원으로, 결제·영수증·환불 문의는 Paddle Buyer Support로 접수할 수 있습니다.',
  },
] as const

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-blue-500 hover:underline">← 돌아가기</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">이용약관</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2026년 8월 24일</p>

      <div className="space-y-6">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-sm font-bold text-gray-800 mb-1.5">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/refund" className="text-blue-500 hover:underline">환불정책</Link>
        <a href="https://www.paddle.com/legal/buyer-terms" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Paddle Buyer Terms</a>
        <a href="https://paddle.net" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Paddle Buyer Support</a>
      </div>
    </div>
  )
}
