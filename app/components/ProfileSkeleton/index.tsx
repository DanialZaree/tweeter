import TweetSkeleton from '../Tweet/TweetSkeleton';

export default function ProfileSkeleton() {
  return (
    <div className="bg-black w-full min-h-screen text-white">
      <div className="mx-auto border-white/10 sm:border-x w-full max-w-2xl min-h-screen">
        {/* Top nav */}
        <div className="top-0 z-10 sticky flex items-center gap-4 sm:gap-6 bg-black/80 backdrop-blur-md px-3 sm:px-4 py-3 border-white/10 border-b animate-pulse">
          <div className="w-5 h-5 rounded-full bg-white/10" />
          <div className="flex flex-col gap-1">
            <div className="w-28 h-4 bg-white/20 rounded" />
            <div className="w-16 h-3 bg-white/10 rounded" />
          </div>
        </div>

        {/* Banner */}
        <div className="relative w-full h-36 sm:h-48 bg-surface/40 animate-pulse">
          {/* Avatar wrapper */}
          <div className="z-10 -bottom-10 sm:-bottom-12 left-4 sm:left-4 absolute">
            <div className="rounded-full outline-4 outline-surface-2 outline-offset-4 w-20 sm:w-24 h-20 sm:h-24 bg-surface-2" />
          </div>
        </div>

        {/* Action row (Edit profile / Follow) */}
        <div className="flex justify-end items-center gap-2 px-3 sm:px-4 pt-3 pb-0 animate-pulse">
          <div className="w-24 h-8 bg-white/10 rounded-full" />
        </div>

        {/* Profile info */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6 pb-4 animate-pulse">
          <div className="w-36 h-5 bg-white/20 rounded" />
          <div className="w-24 h-3.5 bg-white/10 rounded mt-2" />
          <div className="w-4/5 h-3.5 bg-white/10 rounded mt-3.5" />
          <div className="w-3/5 h-3.5 bg-white/10 rounded mt-1.5" />

          <div className="flex gap-4 mt-3">
            <div className="w-24 h-3.5 bg-white/10 rounded" />
            <div className="w-20 h-3.5 bg-white/10 rounded" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 mx-auto mt-2 mb-4 p-1 border-3 border-border/40 rounded-3xl w-full sm:w-fit max-w-xs justify-center animate-pulse">
          <div className="flex-1 h-8 bg-white/10 rounded-2xl" />
          <div className="flex-1 h-8 bg-white/10 rounded-2xl" />
          <div className="flex-1 h-8 bg-white/10 rounded-2xl" />
        </div>

        {/* Tweet feed skeletons */}
        <div className="px-3 sm:px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TweetSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
