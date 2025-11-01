import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TODOアプリ - ユーザー認証付き',
  description: 'Next.js、Hono、PostgreSQLで作成したユーザー認証付きTODOアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
