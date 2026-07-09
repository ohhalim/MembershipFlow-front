import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
const SITE_TITLE = 'MembershipFlow — 골프 회원권 거래소별 시세 비교';
const SITE_DESCRIPTION = '동아골프·동부회원권·시세닷컴·에이스회원권 시세를 한 곳에서 비교하고 최저가를 확인하세요. 목표가 도달 시 즉시 알림.';

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
