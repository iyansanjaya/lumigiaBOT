import type { Metadata } from 'next';
import { Bricolage_Grotesque, Archivo } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['700'],
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'LumigiaBOT — Discord Moderation Bot',
  description: 'Your all-in-one Discord guardian. Powerful moderation, auto-mod, ticketing, and anti-raid protection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${archivo.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
