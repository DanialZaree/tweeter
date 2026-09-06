'use clinet'

import { useEffect, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { getInfiniteTweets } from "@/app/lib/actions/tweet"
import Tweet from "../Tweet"
import TweetSkeleton from "../Tweet/TweetSkeleton"

export default function InfiniteTweetList({ currentUserId, currentUserName, }: { currentUserId?: string; currentUserName?: string; }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['tweets', 'infinite'],
    queryFn: async ({ pageParam }) => {
      const res = await getInfiniteTweets({ cursor: pageParam, limit: 10 })
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch tweets');
      }
      return res;
    },
    initialPageParam: null as string | null,
    getNextPageParam:(lastPage) => lastPage.nextCursor ?? undefined,
  })

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? []

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)

    return ()=> observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
      return (
        <div className="mx-auto w-full max-w-xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <TweetSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="mx-auto w-full max-w-xl text-center py-8 text-red-400">
          <p>{error?.message || 'Something went wrong loading tweets.'}</p>
        </div>
      );
    }
    return (
      <div className="mx-auto w-full max-w-xl">
        {tweets.map((tweet: any) => (
          <Tweet
            key={tweet.id}
            data={tweet}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        ))}
        <div ref={loadMoreRef} className="w-full py-4 flex flex-col items-center justify-center">
          {isFetchingNextPage && (
            <div className="w-full">
              <TweetSkeleton />
            </div>
          )}
          {!hasNextPage && tweets.length > 0 && (
            <p className="text-xs text-text-subtle py-4">
              There is no more :]
            </p>
          )}
        </div>
      </div>
    );
}
