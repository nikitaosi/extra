import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Extra — Expense tracker',
  description: 'A personal expense tracker backed by a Protobuf API and PostgreSQL.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
