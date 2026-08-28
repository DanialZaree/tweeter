import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { JellyTabs } from '@/components/ui/jelly-tabs';
import ImageModal from '@/app/components/ui/ImageModal';

const myFont = localFont({
  src: '../public/fonts/font.ttf',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boblo.ir';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Boblo - Share your thoughts with the world',
    template: '%s | Boblo',
  },
  description:
    'Boblo is a modern platform to share your thoughts, follow creators, and discover conversations.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Boblo',
  },
  applicationName: 'Boblo',
  authors: [{ name: 'Boblo' }],
  keywords: ['Boblo', 'social media', 'microblogging', 'posts', 'community', 'discussions'],
  creator: 'Boblo',
  publisher: 'Boblo',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Boblo',
    title: 'Boblo - Share your thoughts with the world',
    description:
      'Boblo is a modern platform to share your thoughts, follow creators, and discover conversations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boblo - Share your thoughts with the world',
    description:
      'Boblo is a modern platform to share your thoughts, follow creators, and discover conversations.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icons/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icons/logo.svg',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', 'antialiased', 'dark', 'font-sans', myFont.className)}>
      <body
        className={`${myFont.className} flex flex-col min-h-full dark root pb-18`}
        cz-shortcut-listen="false"
      >
        {children}
        <Analytics />
        <SpeedInsights />
        <JellyTabs />
        <ImageModal />
      </body>
    </html>
  );
}
