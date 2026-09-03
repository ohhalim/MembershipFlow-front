import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '환불정책 — MembershipFlow',
  alternates: { canonical: '/refund' },
}

const SECTIONS = [
  {
    title: '1. 결제 및 환불 처리 주체',
    body: 'MembershipFlow의 유료 구독 결제는 Paddle이 판매·결제 주체(Merchant of Record)로서 처리합니다. 결제 취소와 환불 역시 Paddle을 통해 원 결제수단으로 처리됩니다.',
  },
  {
    title: '2. 구독 해지',
    body: '구독은 다음 결제일 전까지 언제든 해지할 수 있습니다. 해지하면 다음 자동결제가 중단되며 이미 결제된 이용 기간이 끝날 때까지 구독 혜택을 사용할 수 있습니다.',
  },
  {
    title: '3. 환불 요청',
    body: '구매 확인 이메일의 View receipt 또는 Manage subscription 링크, Paddle Buyer Support, MembershipFlow 고객지원 이메일을 통해 환불을 요청할 수 있습니다. 요청 시 결제에 사용한 이메일과 거래번호를 함께 알려주세요.',
  },
  {
    title: '4. 환불 조건',
    body: '조건은 없습니다. 이용 기간, 접속 횟수, 알림 수신 건수 등 서비스 이용 내역을 이유로 환불을 거절하거나 환불 금액을 차감하지 않습니다. 결제 수수료도 공제하지 않고 결제하신 전액을 돌려드립니다. 30일이 지난 결제 건이라도 상품이 설명과 다르거나 정상적으로 제공되지 않은 경우 등 법령상 보장된 환불 권리는 제한되지 않습니다.',
  },
  {
    title: '5. 처리 기간 및 문의',
    body: '환불 승인 이후 실제 입금 시점은 결제수단과 금융기관에 따라 달라질 수 있습니다. 상품 이용 문의는 ohhalim777@gmail.com 또는 010-7107-0766으로, 결제·환불 문의는 Paddle Buyer Support로 접수할 수 있습니다.',
  },
] as const

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-500 hover:underline">← 돌아가기</Link>
      <h1 className="mb-2 mt-4 text-2xl font-bold text-gray-900">환불정책</h1>
      <p className="mb-6 text-xs text-gray-400">시행일: 2026년 9월 3일</p>

      <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
        <h2 className="mb-1.5 text-sm font-bold text-blue-900">30일 무조건 환불 보장</h2>
        <p className="text-sm leading-relaxed text-blue-900">
          유료 구독 결제일로부터 30일 이내에는 사유를 묻지 않고 전액 환불해 드립니다.
          어떤 이유로든 만족스럽지 않다면 30일 이내에 고객지원으로 연락 주세요.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-blue-800">
          30-day money-back guarantee. No questions asked. If you are not satisfied for
          any reason, contact support within 30 days for a full refund.
        </p>
      </section>

      <div className="space-y-6">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="mb-1.5 text-sm font-bold text-gray-800">{title}</h2>
            <p className="text-sm leading-relaxed text-gray-600">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Paddle Refund Policy</a>
        <a href="https://paddle.net" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Paddle Buyer Support</a>
      </div>
    </div>
  )
}
