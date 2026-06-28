import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Bricolage_Grotesque, Archivo } from 'next/font/google';
import type { Metadata } from 'next';

const heading = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-heading',
});

const body = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.lumigiabot.com'),
  title: {
    default: 'LumigiaBOT Docs',
    template: '%s | LumigiaBOT Docs',
  },
  description:
    'Dokumentasi resmi LumigiaBOT — Bot Discord all-in-one untuk moderasi, auto-mod, ticketing, leveling, giveaway, dan fitur streamer.',
  openGraph: {
    siteName: 'LumigiaBOT Docs',
    type: 'website',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${heading.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-body">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
