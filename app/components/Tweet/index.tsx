'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toggleTweetLike } from '@/app/lib/actions/actionLike';
import { editTweet } from '@/app/lib/actions/tweet';
import { Button } from '@/components/ui/button';
import { useLikeStore } from '@/app/store/useLikeStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCharLimitStore } from '@/app/store/useCharLimitStore';
import CharLimit from '../CharLimit';
import MoreTweetButton from '../ui/MoreTweetButton';
import { getGradientFromName } from '@/app/lib/avatar';
import Avatar from '../ui/Avatar';
import {
  Repeat2,
  Heart,
  ChartNoAxesColumnIcon,
  MessageCircle,
  Bird,
  Loader2,
} from 'lucide-react';

const schema = z.object({
  tweet: z.string().trim().min(1, 'Tweet is required').max(500, 'Max character is 500'),
});

type FormData = z.infer<typeof schema>;

export interface TweetType {
  data: {
    id: string;
    authorId: string;
    tweetId?: string | null;
    content: string;
    isEdited?: boolean;
    createdAt: Date | string;
    author: {
      id: string;
      name: string | null;
      createdAt: Date | string;
      job: string | null;
      avatar: string | null;
      userName: string | null;
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
  const { content, createdAt, author, tweetId: rawTweetId, id, isEdited } = data;
  const tweetId = rawTweetId || id;

  const bgGradient = author?.avatar ? 'bg-sky-500' : getGradientFromName(author?.userName || 'user');

  const { likedTweets, likeCounts, optimisticToggleLike, revertToggleLike } = useLikeStore();

  const isLikedByCurrentUser = currentUserId
    ? data.likes?.some((like) => like.userId === currentUserId)
    : false;
  const isLiked = likedTweets[id] ?? isLikedByCurrentUser;
  const currentLikes = likeCounts[id] ?? data.likes?.length ?? 0;

  const formattedDate = useMemo(() => {
    const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return createdAtDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }, [createdAt]);

  const [isEditing, setIsEditing] = useState(false);
  const { updateChar } = useCharLimitStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tweet: content,
    },
  });

  async function onSubmit(data: FormData) {
    if (data.tweet === content) {
      setIsEditing(false);
      return;
    }
    const result = await editTweet(id, data.tweet);
    if (result?.success) {
      setIsEditing(false);
    } else {
      console.error(result?.error);
    }
  }

  function charLimitHandler(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const currentLength = event.target.value.length;
    updateChar(currentLength);
  }

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
          <Link
            className={`shrink-0 rounded-full outline-2 outline-surface-2 outline-offset-2 w-10 h-10 sm:w-12 sm:h-12 overflow-hidden ${bgGradient}`}
            href={`/${author?.userName || ''}`}
            aria-label={`${author?.name || 'User'}'s profile`}
          >
            <Avatar name={author?.name || 'User'} image={author?.avatar} size={48} className="" />
          </Link>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="font-semibold text-sm sm:text-base text-left truncate">
              {author?.name || 'User'}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-text-muted text-xs sm:text-sm truncate">
              <div className="truncate">@{author?.userName || 'user'}</div>
              {author.job && (
                <div className="px-1.5 py-0.5 border border-text-subtle rounded-lg text-xs">
                  {author.job}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">{currentUserId === data.authorId && <MoreTweetButton tweetId={data.id} onEdit={() => { setIsEditing(true); setValue('tweet', content); updateChar(content.length); }} />}</div>
      </div>
      {isEditing ? (
        <form className="mt-3 sm:mt-4 flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start gap-1">
            <textarea
              {...register('tweet', {
                onChange: (e) => {
                  charLimitHandler(e);
                },
              })}
              rows={4}
              placeholder="Edit tweet"
              maxLength={500}
              dir='auto'
              disabled={isSubmitting}
              className={`${errors.tweet ? 'focus:outline-red-500 border-red-500' : 'focus:outline-white'} pt-3 pb-10 pl-3.5 pr-2 border border-border/60 rounded-md focus:outline-2 focus:-outline-offset-1 w-full font-normal text-white text-sm sm:text-base resize-y disabled:opacity-50`}
            />
            <CharLimit charLimit={500} />
            {errors.tweet && <p className="text-red-800 text-sm">{errors.tweet.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => { setIsEditing(false); reset(); }} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div dir="auto" className="mt-3 sm:mt-4 sm:text-[16px] text-sm text-start whitespace-pre-line wrap-break-word leading-relaxed tracking-wide">
          {content}
        </div>
      )}
      <div className="flex flex-row justify-between items-center mt-3 sm:mt-4 text-xs sm:text-sm">
        <div className="group flex items-center gap-1 text-text-muted">
          <button type="button" aria-label="Retweet" className="hover:bg-green-500/10 p-1.5 rounded-full cursor-pointer bg-transparent border-0">
            <Repeat2 className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-green-500 duration-150" />
          </button>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <Link
            href={`/tweet/${tweetId}`}
            aria-label="Reply to tweet"
            className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer"
          >
            <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-blue-500 duration-150" />
          </Link>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <div
            className={`group-hover:text-red-500 duration-150 ${isLiked ? 'text-red-500' : 'text-text-muted'}`}
          >
            {currentLikes}
          </div>
          <button
            type="button"
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike tweet' : 'Like tweet'}
            className="hover:bg-red-500/10 p-1.5 rounded-full cursor-pointer bg-transparent border-0"
          >
            <Heart
              fill={isLiked ? 'currentColor' : 'none'}
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'text-red-500' : 'text-text-muted group-hover:text-red-500'}`}
            />
          </button>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <button type="button" aria-label="Views" className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer bg-transparent border-0">
            <ChartNoAxesColumnIcon className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-blue-500 duration-150" />
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-between items-end mt-2 pt-2 border-surface border-t text-text-muted text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <Bird className="w-4 h-4" />
          Boblo
        </div>
        <div className="flex items-center gap-1">
          {isEdited && <span className="italic">(edited)</span>}
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
