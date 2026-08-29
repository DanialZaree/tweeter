import type { Metadata } from 'next';
import { auth } from './auth';
import Navbar from './components/Navbar';
import Frame from './components/Frame';
import InstallPrompt from '@/components/InstallPrompt';
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

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Navbar />
      <Frame>
        <main className="flex flex-col gap-12 pb-16">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center mt-8 gap-6 px-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
              Welcome to Boblo
            </h1>
            <p className="text-lg text-text-muted max-w-md">
              A modern platform to share your thoughts, follow creators, and discover meaningful
              conversations.
            </p>
            <div className="flex flex-row gap-4 mt-2">
              {!session ? (
                <>
                  <Link
                    href="/auth"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/explore"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-surface rounded-full hover:bg-surface-2 transition-colors border border-white/10"
                  >
                    Explore Posts
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/explore"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Explore Posts
                  </Link>
                  <Link
                    href={`/${session.user.userName || 'profile'}`}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-surface rounded-full hover:bg-surface-2 transition-colors border border-white/10"
                  >
                    My Profile
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Site News / Announcements */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              What's New
            </h2>
            <div className="flex flex-col gap-3">
              <div className="bg-card border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white">Following Feed is Live!</h3>
                  <span className="text-xs text-text-muted">Just now</span>
                </div>
                <p className="text-sm text-text-subtle">
                  You can now see posts exclusively from people you follow in the Explore tab. Stay
                  up to date with your favorite creators.
                </p>
              </div>
              <div className="bg-card border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white">Share Posts as Screenshots</h3>
                  <span className="text-xs text-text-muted">Aug 2026</span>
                </div>
                <p className="text-sm text-text-subtle">
                  Use the share button on any post to generate and save a beautiful image of it,
                  perfect for cross-posting to other platforms.
                </p>
              </div>
            </div>
          </section>

          {/* Changelog */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
              Recent Updates
            </h2>
            <div className="border-l-2 border-surface-2 ml-3 flex flex-col gap-6 pt-2 pb-2">
              <div className="relative pl-6">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="text-xs font-semibold text-blue-400 mb-1">v0.1.25 • Aug 2026</div>
                <div className="text-sm text-text-muted">
                  Added Terms of Service and Privacy Policy pages.
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-surface-2"></div>
                <div className="text-xs font-semibold text-text-subtle mb-1">
                  v0.1.24 • Aug 2026
                </div>
                <div className="text-sm text-text-muted">
                  Redesigned the Home page as a Content Hub.
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-surface-2"></div>
                <div className="text-xs font-semibold text-text-subtle mb-1">
                  v0.1.23 • Aug 2026
                </div>
                <div className="text-sm text-text-muted">
                  Introduced the Following tab in Explore and fixed SSRF vulnerabilities.
                </div>
              </div>
            </div>
          </section>

          {/* Install the App Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Get Boblo on Your Device</h2>
            <div className="p-5 sm:p-8 border border-white/10 rounded-3xl bg-neutral-900/30 flex flex-col gap-8 relative overflow-hidden shadow-xl">
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
                    <div className="bg-sky-500/10 p-3.5 rounded-2xl text-sky-400 shrink-0 shadow-inner">
                      <Smartphone size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">Take Boblo everywhere</h3>
                      <p className="text-neutral-400 text-sm mt-1">
                        Faster, native-like experience. Launches instantly and stays on your home
                        screen.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 bg-neutral-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <Zap size={14} className="text-sky-400" />
                      <span className="text-xs font-medium text-neutral-300">Instant launch</span>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <Bell size={14} className="text-emerald-400" />
                      <span className="text-xs font-medium text-neutral-300">
                        Push notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <Smartphone size={14} className="text-purple-400" />
                      <span className="text-xs font-medium text-neutral-300">No app store</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 md:w-1/3 w-full border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                  <div className="w-full flex justify-center sm:justify-end">
                    <InstallPrompt />
                  </div>

                  <div className="text-center sm:text-right mt-2 text-xs text-neutral-500 max-w-[200px]">
                    <span className="block font-semibold text-neutral-400 mb-1">iOS Users:</span>
                    Tap the <strong>Share</strong> button in Safari, then select{' '}
                    <strong>Add to Home Screen</strong>.
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
