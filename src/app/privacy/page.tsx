import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 — MembershipFlow',
}

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보 항목',
    body: 'Google 계정 연동 로그인 시 이메일 주소, 이름, 프로필 사진을 수집합니다. 유료 구독 결제 시 결제 정보는 결제대행사(토스페이먼츠)가 처리하며, 서비스는 카드번호 등 민감한 결제 정보를 직접 저장하지 않습니다.',
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    body: '회원 식별 및 로그인, 관심종목·목표가 알림 제공, 유료 구독 관리, 서비스 개선을 위한 통계 분석에 이용합니다.',
  },
  {
    title: '3. 보유 및 이용 기간',
    body: '회원 탈퇴 시 지체 없이 파기합니다. 단, 전자상거래법 등 관련 법령에 따라 결제 기록은 5년간 보관될 수 있습니다.',
  },
  {
    title: '4. 제3자 제공',
    body: '이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 결제 처리를 위해 토스페이먼츠에 결제에 필요한 최소한의 정보가 전달됩니다.',
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
