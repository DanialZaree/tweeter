import { create } from 'zustand';

interface LikeState {
  likeCounts: Record<string, number>;
  likedTweets: Record<string, boolean>;

  setInitialLikes: (likes: Record<string, number>, likesId: string[]) => void;
  optimisticToggleLike: (tweetId: string) => void;
}

export const useLikeStore = create<LikeState>((set) => ({
  likeCounts: {},
  likedTweets: {},

  setInitialLikes: (likes, likedIds) =>
    set({
      likeCounts: likes,
      likedTweets: Object.fromEntries(likedIds.map((id) => [id, true])),
    }),

  optimisticToggleLike: (tweetId) =>
    set((state) => {
      const isLiked = !!state.likedTweets[tweetId];
      const currentCount = state.likeCounts[tweetId] || 0;

      return {
        likedTweets: { ...state.likedTweets, [tweetId]: !isLiked },
        likeCounts: {
          ...state.likeCounts,
          [tweetId]: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
        },
      };
    }),
}));
