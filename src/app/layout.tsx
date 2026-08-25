import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Resume Revolution',
  description: 'Create professional, ATS-friendly resumes and cover letters.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
