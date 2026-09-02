import Navbar from '../components/Navbar';
import Frame from '../components/Frame';

export default function HomeLoading() {
  return (
    <>
      <Navbar />
      <Frame>
        <main className="flex flex-col gap-12 pb-16 animate-pulse">
          {/* Hero Section Skeleton */}
          <section className="flex flex-col items-center text-center mt-8 gap-6 px-4">
            <div className="w-64 sm:w-96 h-12 sm:h-14 bg-surface rounded-lg"></div>
            <div className="w-full max-w-md h-16 bg-surface rounded-lg"></div>
            <div className="flex flex-row gap-4 mt-2">
              <div className="w-32 h-10 bg-surface rounded-full"></div>
              <div className="w-32 h-10 bg-surface rounded-full"></div>
            </div>
          </section>

          {/* Site News Skeleton */}
          <section className="flex flex-col gap-4">
            <div className="w-40 h-7 bg-surface rounded-md"></div>
            <div className="flex flex-col gap-3">
              <div className="border border-white/10 rounded-xl p-4 sm:p-5 h-28 bg-card"></div>
              <div className="border border-white/10 rounded-xl p-4 sm:p-5 h-28 bg-card"></div>
            </div>
          </section>

          {/* Changelog Skeleton */}
          <section className="flex flex-col gap-4">
            <div className="w-48 h-7 bg-surface rounded-md"></div>
            <div className="border-l-2 border-surface-2 ml-3 flex flex-col gap-6 pt-2 pb-2">
              <div className="pl-6 h-12">
                <div className="w-24 h-4 bg-surface rounded mb-2"></div>
                <div className="w-full max-w-sm h-4 bg-surface rounded"></div>
              </div>
              <div className="pl-6 h-12">
                <div className="w-24 h-4 bg-surface rounded mb-2"></div>
                <div className="w-full max-w-sm h-4 bg-surface rounded"></div>
              </div>
              <div className="pl-6 h-12">
                <div className="w-24 h-4 bg-surface rounded mb-2"></div>
                <div className="w-full max-w-sm h-4 bg-surface rounded"></div>
              </div>
            </div>
          </section>

          {/* Install Section Skeleton */}
          <section className="flex flex-col gap-4">
            <div className="w-56 h-7 bg-surface rounded-md"></div>
            <div className="h-[280px] border border-white/10 rounded-3xl bg-neutral-900/30"></div>
          </section>
        </main>

        {/* Footer Skeleton */}
        <footer className="border-t border-white/10 py-8 px-4 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-50">
          <div className="w-48 h-4 bg-surface rounded"></div>
          <div className="flex gap-4">
            <div className="w-12 h-4 bg-surface rounded"></div>
            <div className="w-12 h-4 bg-surface rounded"></div>
            <div className="w-12 h-4 bg-surface rounded"></div>
          </div>
        </footer>
      </Frame>
    </>
  );
}
