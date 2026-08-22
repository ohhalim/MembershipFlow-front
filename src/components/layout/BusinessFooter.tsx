import Link from 'next/link'

export function BusinessFooter() {
  const businessInfo = {
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME,
    registrationNumber: process.env.NEXT_PUBLIC_BUSINESS_REGISTRATION_NUMBER,
    representative: process.env.NEXT_PUBLIC_BUSINESS_REPRESENTATIVE,
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
  }
  if (Object.values(businessInfo).some((value) => !value)) return null

  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-6 py-6 text-xs leading-relaxed text-gray-500">
      <div className="mx-auto max-w-4xl space-y-1">
        <p>
          <strong className="font-semibold text-gray-700">{businessInfo.name}</strong>
          {' · '}대표 {businessInfo.representative}
          {' · '}사업자등록번호 {businessInfo.registrationNumber}
        </p>
        <p>{businessInfo.address}</p>
        <p>
          고객문의{' '}
          <a href={`tel:${businessInfo.phone}`} className="hover:text-gray-700">{businessInfo.phone}</a>
          {' · '}
          <a href={`mailto:${businessInfo.email}`} className="hover:text-gray-700">{businessInfo.email}</a>
        </p>
        <div className="flex gap-3 pt-1">
          <Link href="/terms" className="hover:text-gray-700">이용약관</Link>
          <Link href="/privacy" className="hover:text-gray-700">개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  )
}
