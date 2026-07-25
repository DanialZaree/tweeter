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

export interface TweetType {
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
      job: string | null;
      avatar: string | null;
      userName: string;
    };
    likes: {
      id: string;
      userId: string;
      tweetId: string;
    }[];
  };
  currentUserId?: string;
}

export default function Tweet({ data, currentUserId }: TweetType) {
  const { content, createdAt, author, tweetId, id } = data;

  const bgGradient = author.avatar ? 'bg-sky-500' : getGradientFromName(author.userName);

  const { likedTweets, likeCounts, optimisticToggleLike, revertToggleLike } = useLikeStore();

  const isLikedByCurrentUser = currentUserId ? data.likes?.some((like) => like.userId === currentUserId) : false;
  const isLiked = likedTweets[id] ?? isLikedByCurrentUser;
  const currentLikes = likeCounts[id] ?? (data.likes?.length ?? 0);

  const formattedDate = useMemo(() => {
    const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return createdAtDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }, [createdAt]);

  async function handleLike() {
    console.log('Sending Tweet ID:', id);
    const previousLiked = isLiked;
    const previousCount = currentLikes;

    optimisticToggleLike(id, isLiked, currentLikes);

    const result = await toggleTweetLike(id);

    if (!result?.success) {
      console.log('error like');
      revertToggleLike(id, previousLiked, previousCount);
    }
  }

  return (
    <div className="flex flex-col my-4 sm:my-6 p-3 sm:p-4 border border-surface rounded-xl w-full transition hover:-translate-y-0.5 duration-300">
      <div className="flex justify-between items-start">
        <div className="flex flex-row items-center gap-2.5 sm:gap-3 min-w-0">
          <Link className={`shrink-0 rounded-full outline-2 outline-surface-2 outline-offset-2 w-10 h-10 sm:w-12 sm:h-12 overflow-hidden ${bgGradient}`} href={`/${author.userName}`}>
            <Avatar name={author?.name} image={author?.avatar} size={48} className="" />
          </Link>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className='font-semibold text-sm sm:text-base text-left truncate'>{author.name}</div>
            <div className="flex flex-wrap items-center gap-1.5 text-text-muted text-xs sm:text-sm truncate">
              {author.job && (
                <div className="px-1.5 py-0.5 border border-text-subtle rounded-lg text-xs">{author.job}</div>
              )}
              <div className="truncate">@{author.userName}</div>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <MoreTweetButton />
        </div>
      </div>
      <div className="mt-3 sm:mt-4 text-sm sm:text-[16px] text-left break-words leading-relaxed tracking-wide">
        {content}
      </div>
      <div className="flex flex-row justify-between items-center mt-3 sm:mt-4 text-xs sm:text-sm">
        <div className="group flex items-center gap-1 text-text-muted">
          <div className="hover:bg-green-500/10 p-1.5 rounded-full cursor-pointer">
            <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-hover:text-green-500 duration-150" />
          </div>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <Link href={`/tweet/${tweetId}`} className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer">
            <MessageCircle
              className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-hover:text-blue-500 duration-150"
            />
          </Link>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
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
              fill={isLiked ? 'currentColor' : 'none'}
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'text-red-500' : 'text-text-muted group-hover:text-red-500'}`}
            />
          </div>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <div className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer">
            <ChartNoAxesColumnIcon
              className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-hover:text-blue-500 duration-150"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-end mt-2 pt-2 border-surface border-t text-xs sm:text-sm text-text-muted">
        <div className="flex items-center gap-1">
          <Bird className="w-4 h-4" />
          Tweeter
        </div>
        <div>{formattedDate}</div>
      </div>
    </div>
  );
}
