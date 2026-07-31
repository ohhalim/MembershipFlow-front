import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EXCHANGE_NAMES_TEXT } from '@/lib/exchanges';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://membershipflow.site';
const SITE_TITLE = '골프 회원권 최저가 찾기 | MembershipFlow';
const SITE_DESCRIPTION = `${EXCHANGE_NAMES_TEXT}의 골프 회원권 시세를 한 번에 비교하고 최저가를 찾아보세요. 목표가 도달 알림도 받을 수 있습니다.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | MembershipFlow',
  },
  description: SITE_DESCRIPTION,
  keywords: ['골프 회원권', '회원권 시세', '골프 회원권 시세', '골프 회원권 거래소', '골프 회원권 시세 비교', '골프 회원권 최저가'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'MembershipFlow',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
