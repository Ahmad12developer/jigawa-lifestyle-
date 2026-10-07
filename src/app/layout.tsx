import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jigawa Lifestyle — Browser Life Simulation',
  description: 'An authentic life simulation game rooted in Jigawa State, Nigeria. Build respect, earn Naira, and navigate local opportunities across Dutse, Hadejia, and beyond.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
