'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { toggleTweetLike } from '@/app/lib/actions/actionLike';
import { useLikeStore } from '@/app/store/useLikeStore';
import MoreTweetButton from '../ui/MoreTweetButton';
import { getGradientFromName } from '@/app/lib/avatar';
import Avatar from '../ui/Avatar';
import {
  MoreHorizontal,
  Repeat2,
  Heart,
  ChartNoAxesColumnIcon,
  MessageCircle,
  Bird,
} from 'lucide-react';

interface TweetType {
  data: {
    id: string;
    authorId: string;
    tweetId: string;
    content: string;
    createdAt: Date | string;
    author: {
      id: string;
      name: string;
      createdAt: Date | string;
      job: string;
      avatar: string;
      userName: string;
    };
    likes: {
      id: string;
      userId: string;
      tweetId: string;
    }[];
  };
}

export default function Tweet({ data }: TweetType) {
  const { content, createdAt, author, tweetId, id } = data;

  const bgGradient = author.avatar ? 'bg-sky-500' : getGradientFromName(author.userName);

  const { likedTweets, likeCounts, optimisticToggleLike } = useLikeStore();

  const isLiked = !!likedTweets[tweetId];
  const currentLikes = likeCounts[tweetId] ?? data.likes.length;

  const formattedDate = useMemo(() => {
    const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return createdAtDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }, [createdAt]);

  async function handleLike() {
    console.log('Sending Tweet ID:', tweetId);
    const previousLiked = useLikeStore.getState().likedTweets[tweetId];
    const previousCount = useLikeStore.getState().likeCounts[tweetId];

    optimisticToggleLike(tweetId);

    const result = await toggleTweetLike(id, '69efdb9197898e868db51d49');

    if (!result.success) {
      console.log('error like');
      useLikeStore.setState((state) => ({
        likedTweets: { ...state.likedTweets, [tweetId]: previousLiked },
        likeCounts: { ...state.likeCounts, [tweetId]: previousCount },
      }));
    }
  }

  return (
    <div className="flex flex-col my-6 p-4 border border-surface rounded-xl w-full transition hover:-translate-y-0.5 duration-300">
      <div className="flex justify-between">
        <div className="flex flex-row gap-3">
          <div className={`rounded-full outline-2 outline-surface-2 outline-offset-2 w-12 h-12 overflow-hidden ${bgGradient}`}>
            <Avatar name={author?.name} image={author?.avatar} size={48} className="" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div>{author.name}</div>
            <div className="flex flex-row items-center gap-1.5 text-text-muted text-sm">
              {author.job && (
                <div className="px-2 py-0.5 border border-text-subtle rounded-lg">{author.job}</div>
              )}
              <div>@{author.userName}</div>
            </div>
          </div>
        </div>
        <div>
          {/* <MoreHorizontal className="text-text-muted hover:text-white" /> */}
          <MoreTweetButton />
        </div>
      </div>
      <div className="mt-4 text-[16px] text-left wrap-break-word leading-relaxed tracking-wide">
        {content}
      </div>
      <div className="flex flex-row justify-between mt-4">
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="hover:bg-green-500/10 p-1.5 rounded-full cursor-pointer">
            <Repeat2 className="text-text-muted group-hover:text-green-500 duration-150" />
          </div>
        </div>
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <div className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer">
            <MessageCircle
              size={20}
              className="text-text-muted group-hover:text-blue-500 duration-150"
            />
          </div>
        </div>
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div
            className={`group-hover:text-red-500 duration-150 ${isLiked ? 'text-red-500' : 'text-text-muted'}`}
          >
            {currentLikes}
          </div>
          <div
            onClick={handleLike}
            className="hover:bg-red-500/10 p-1.5 rounded-full cursor-pointer"
          >
            <Heart
              size={20}
              className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-text-muted group-hover:text-red-500'}`}
            />
          </div>
        </div>
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <div className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer">
            <ChartNoAxesColumnIcon
              size={20}
              className="text-text-muted group-hover:text-blue-500 duration-150"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-end mt-2 pt-2 border-surface border-t">
        <div className="flex items-end gap-1">
          <Bird />
          Tweeter
        </div>
        <div>{formattedDate}</div>
      </div>
    </div>
  );
}
