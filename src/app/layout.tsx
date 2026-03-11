import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calculator',
  description: 'A fullstack calculator application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
