import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 — MembershipFlow',
  alternates: { canonical: '/privacy' },
}

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보 항목',
    body: 'Google 계정 연동 로그인 시 이메일 주소, 이름, 프로필 사진을 수집합니다. 서비스 이용 과정에서 방문 페이지, 접속 시각, 브라우저·기기 정보 등 비식별 이용 통계가 Google Analytics 4를 통해 수집될 수 있습니다. 이름·이메일·결제정보는 Google Analytics로 전송하지 않습니다. 유료 구독 결제 과정에서 Paddle이 구매자 이메일, 결제수단 및 청구 정보를 직접 수집·처리합니다. MembershipFlow에는 거래·고객·구독 식별자, 결제 상태와 이용 기간 등 서비스 제공에 필요한 결과만 전달되며 카드번호는 저장하지 않습니다.',
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    body: '회원 식별 및 로그인, 관심종목·목표가 알림 제공, 유료 구독 관리, Google Analytics 4를 활용한 서비스 이용 통계 분석 및 서비스 개선에 이용합니다.',
  },
  {
    title: '3. 보유 및 이용 기간',
    body: '회원 탈퇴 시 지체 없이 파기합니다. 단, 전자상거래법 등 관련 법령에 따라 결제 기록은 5년간 보관될 수 있습니다.',
  },
  {
    title: '4. 제3자 제공',
    body: '통계 분석을 위해 Google Analytics 4가 비식별 이용 정보를 처리할 수 있습니다. Paddle은 유료 구독의 판매·결제 주체(Merchant of Record)로서 결제, 세금, 영수증, 부정거래 방지와 환불 처리를 위해 구매자 정보를 독립적으로 처리합니다. Paddle의 개인정보 처리 기준은 Paddle Privacy Notice에서 확인할 수 있습니다.',
  },
  {
    title: '5. 이용자의 권리',
    body: '이용자는 언제든지 본인의 개인정보 열람·정정·삭제(회원 탈퇴)를 요청할 수 있습니다.',
  },
  {
    title: '6. 개인정보 보호를 위한 조치',
    body: '전송 구간 암호화(HTTPS), 접근 권한 최소화 등 개인정보 보호를 위한 기술적·관리적 조치를 시행합니다.',
  },
  {
    title: '7. 문의',
    body: '개인정보 관련 문의는 ohhalim777@gmail.com 으로 연락해 주세요.',
  },
] as const

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-blue-500 hover:underline">← 돌아가기</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">개인정보처리방침</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2026년 8월 24일</p>

      <div className="space-y-6">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-sm font-bold text-gray-800 mb-1.5">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 text-sm">
        <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Paddle Privacy Notice</a>
      </div>
    </div>
  )
}
