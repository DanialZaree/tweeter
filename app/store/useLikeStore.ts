import { create } from 'zustand';

interface LikeState {
  likeCounts: Record<string, number>;
  likedTweets: Record<string, boolean>;

  optimisticToggleLike: (tweetId: string, currentIsLiked: boolean, currentCount: number) => void;
  revertToggleLike: (tweetId: string, previousIsLiked: boolean, previousCount: number) => void;
}

export const useLikeStore = create<LikeState>((set) => ({
  likeCounts: {},
  likedTweets: {},

  optimisticToggleLike: (tweetId, currentIsLiked, currentCount) =>
    set((state) => {
      const isLiked = state.likedTweets[tweetId] ?? currentIsLiked;
      const count = state.likeCounts[tweetId] ?? currentCount;

      return {
        likedTweets: { ...state.likedTweets, [tweetId]: !isLiked },
        likeCounts: {
          ...state.likeCounts,
          [tweetId]: isLiked ? Math.max(0, count - 1) : count + 1,
        },
      };
    }),

  revertToggleLike: (tweetId, previousIsLiked, previousCount) =>
    set((state) => ({
      likedTweets: { ...state.likedTweets, [tweetId]: previousIsLiked },
      likeCounts: { ...state.likeCounts, [tweetId]: previousCount },
    })),
}));
