export default function TweetSkeleton() {
  return (
    <div className="flex flex-col my-4 sm:my-6 p-3 sm:p-4 border border-surface rounded-xl w-full animate-pulse">
      {/* Header: avatar + name/handle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="shrink-0 bg-surface-2/60 rounded-full w-10 h-10 sm:w-12 sm:h-12" />
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="bg-surface-2/70 rounded-md w-28 h-4" />
          <div className="bg-surface-2/40 rounded-md w-20 h-3" />
        </div>
      </div>

      {/* Tweet text lines */}
      <div className="flex flex-col gap-2 mt-3 sm:mt-4">
        <div className="bg-surface-2/50 rounded-md w-full h-3.5" />
        <div className="bg-surface-2/50 rounded-md w-11/12 h-3.5" />
        <div className="bg-surface-2/50 rounded-md w-3/5 h-3.5" />
      </div>

      {/* Action buttons bar */}
      <div className="flex justify-between items-center mt-3 sm:mt-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="bg-surface-2/50 rounded-full w-5 h-5" />
          <div className="bg-surface-2/30 rounded w-4 h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-surface-2/50 rounded-full w-5 h-5" />
          <div className="bg-surface-2/30 rounded w-4 h-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-surface-2/50 rounded-full w-5 h-5" />
          <div className="bg-surface-2/30 rounded w-4 h-3" />
        </div>
        <div className="bg-surface-2/50 rounded-full w-5 h-5" />
      </div>

      {/* Footer bar */}
      <div className="flex justify-between items-center mt-2 pt-2 border-surface border-t">
        <div className="bg-surface-2/40 rounded w-16 h-3" />
        <div className="bg-surface-2/40 rounded w-24 h-3" />
      </div>
    </div>
  );
}
