import type { Metadata } from 'next';
import { Suspense } from 'react';
import Navbar, { NavbarSkeleton } from '../components/Navbar';
import Frame from '../components/Frame';
import InstallPrompt from '@/components/InstallPrompt';
import HomeAuthActions, { HomeAuthActionsSkeleton } from '@/app/components/HomeAuthActions';
import Link from 'next/link';
import {
  ArrowRight,
  Newspaper,
  Zap,
  Bell,
  Smartphone,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Home',
  description: 'Connect and share your thoughts in real time on Boblo.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Home | Boblo',
    description: 'Connect and share your thoughts in real time on Boblo.',
    url: '/',
  },
};

export default function Home() {
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <Frame>
        <main className="flex flex-col gap-12 pb-16">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center mt-8 gap-6 px-4">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight bg-linear-to-br from-white to-neutral-400 bg-clip-text text-transparent">
              Welcome to Boblo
            </h1>
            <p className="text-lg text-text-muted max-w-md">
              A modern platform to share your thoughts, follow creators, and discover meaningful
              conversations.
            </p>
            <Suspense fallback={<HomeAuthActionsSkeleton />}>
              <HomeAuthActions />
            </Suspense>
          </section>

          {/* Site News / Announcements */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              What's New
            </h2>
            <div className="flex flex-col gap-3">
              <div className="bg-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white">Infinite Scroll with TanStack Query</h3>
                  <span className="text-xs text-text-subtle">Just now</span>
                </div>
                <p className="text-sm text-text-subtle">
                  Enjoy seamless, continuous scrolling across Explore (Everyone & Following feeds)
                  and Profile (Posts, Replies, & Retweets) with instant in-memory caching.
                </p>
              </div>
              <div className="bg-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white">Real-Time Feed Invalidation</h3>
                  <span className="text-xs text-text-subtle">Sep 2026</span>
                </div>
                <p className="text-sm text-text-subtle">
                  Whenever you post a new tweet, all your feeds update immediately at the top without
                  requiring any full page reloads.
                </p>
              </div>
            </div>
          </section>

          {/* Changelog */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
              Recent Updates
            </h2>
            <div className="border-l-2 border-surface-2 ml-3 flex flex-col gap-6 pt-2 pb-2">
              <div className="relative pl-6">
                <div className="absolute -left-1.25 top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="text-xs font-semibold text-blue-400 mb-1">v0.2.0 • Sep 2026</div>
                <div className="text-sm text-text-muted">
                  Added unified TanStack Query infinite scroll for Explore and Profile tabs (Posts, Replies, Retweets).
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-1.25 top-1.5 w-2 h-2 rounded-full bg-surface-2"></div>
                <div className="text-xs font-semibold text-text-subtle mb-1">
                  v0.1.26 • Sep 2026
                </div>
                <div className="text-sm text-text-muted">
                  Added web push notifications with custom avatar icons and badge branding.
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-1.25 top-1.5 w-2 h-2 rounded-full bg-surface-2"></div>
                <div className="text-xs font-semibold text-text-subtle mb-1">
                  v0.1.25 • Aug 2026
                </div>
                <div className="text-sm text-text-muted">
                  Added Terms of Service and Privacy Policy pages.
                </div>
              </div>
            </div>
          </section>

          {/* Install the App Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Get Boblo on Your Device</h2>
            <div className="p-4 sm:p-8 border border-white/10 rounded-2xl bg-neutral-900/30 flex flex-col gap-8 relative overflow-hidden shadow-md">
              {/* Subtle background logo effect */}
              <img
                src="/logo.svg"
                alt=""
                className="absolute -right-20 -top-20 w-96 h-96 opacity-5 scale-150 pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex flex-col md:flex-row gap-8 relative z-10 items-center">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 shrink-0 shadow-inner">
                      <Smartphone size={28} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-white">Take Boblo everywhere</h3>
                      <p className="text-text-subtle text-sm mt-1">
                        Faster, native-like experience. Launches instantly and stays on your home
                        screen.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 bg-neutral-950/50 px-3 py-2 rounded-lg border border-white/5">
                      <Zap size={14} className="text-sky-400" />
                      <span className="text-xs font-semibold text-neutral-300">Instant launch</span>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-950/50 px-3 py-2 rounded-lg border border-white/5">
                      <Bell size={14} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-neutral-300">
                        Push notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-950/50 px-3 py-2 rounded-lg border border-white/5">
                      <Smartphone size={14} className="text-purple-400" />
                      <span className="text-xs font-semibold text-neutral-300">No app store</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 md:w-1/3 w-full border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                  <div className="w-full flex flex-col items-center sm:items-end gap-3 justify-center sm:justify-end">
                    <InstallPrompt />
                  </div>

                  <div className="text-center sm:text-right mt-2 text-xs text-text-subtle max-w-50">
                    <span className="block font-semibold text-text-muted mb-1">iOS Users:</span>
                    Tap the <strong className="font-semibold">Share</strong> button in Safari, then
                    select <strong className="font-semibold">Add to Home Screen</strong>.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-subtle">
          <p>© {new Date().getFullYear()} Boblo. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/explore" className="hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </footer>
      </Frame>
    </>
  );
}
