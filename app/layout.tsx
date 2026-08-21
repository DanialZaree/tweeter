import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Boblo',
  description: 'Boblo - Share your thoughts with the world',
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
