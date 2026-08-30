'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useRef } from 'react';
import { toggleTweetLike } from '@/app/lib/actions/actionLike';
import { editTweet } from '@/app/lib/actions/tweet';
import { Button } from '@/components/ui/button';
import { useLikeStore } from '@/app/store/useLikeStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCharLimitStore } from '@/app/store/useCharLimitStore';
import { useDrawerStore } from '@/app/store/useDrawerStore';
import { useImageModalStore } from '@/app/store/useImageModalStore';
import CharLimit from '../CharLimit';
import MoreTweetButton from '../ui/MoreTweetButton';
import { getGradientFromName } from '@/app/lib/avatar';
import Avatar from '../ui/Avatar';
import { domToBlob } from 'modern-screenshot';
import { Repeat2, Heart, Share2, MessageCircle, Loader2 } from 'lucide-react';

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
    mediaUrl?: string | null;
    originalTweetDeleted?: boolean;
    createdAt: Date | string;
    parentId?: string | null;
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
    _count?: { replies?: number; retweets?: number };
    totalReplies?: number;
    replies?: {
      id: string;
      authorId: string;
      tweetId?: string | null;
      content: string;
      isEdited?: boolean;
      mediaUrl?: string | null;
      createdAt: Date | string;
      parentId: string | null;
      author: {
        id: string;
        name: string | null;
        createdAt: Date | string;
        job: string | null;
        avatar: string | null;
        userName: string | null;
      };
      likes: { id: string; userId: string; tweetId: string }[];
      _count?: { replies: number };
      totalReplies?: number;
    }[];
    retweetOfId?: string | null;
    retweetOf?: {
      id: string;
      tweetId?: string | null;
      content: string;
      mediaUrl?: string | null;
      createdAt: Date | string;
      author: {
        id: string;
        name: string | null;
        userName: string | null;
        avatar: string | null;
        job: string | null;
      };
      likes?: { id: string; userId: string; tweetId: string }[];
      retweets?: { authorId: string }[];
      _count?: { replies: number; retweets: number };
      totalReplies?: number;
    } | null;
    retweets?: { authorId: string }[];
  };
  currentUserId?: string;
  currentUserName?: string;
}

export default function Tweet({ data, currentUserId, currentUserName }: TweetType) {
  const tweetRef = useRef<HTMLDivElement>(null);

  const { content, createdAt, author, tweetId: rawTweetId, id, isEdited } = data;
  const tweetId = rawTweetId || id;
  const isAdmin = currentUserName?.toLowerCase() === 'danial';

  const bgGradient = author?.avatar
    ? 'bg-sky-500'
    : getGradientFromName(author?.userName || 'user');

  const { likedTweets, likeCounts, optimisticToggleLike, revertToggleLike } = useLikeStore();
  const { openDrawer } = useDrawerStore();
  const { open } = useImageModalStore();

  const isLikedByCurrentUser = currentUserId
    ? data.likes?.some((like) => like.userId === currentUserId)
    : false;
  const isLiked = likedTweets[id] ?? isLikedByCurrentUser;
  const currentLikes = likeCounts[id] ?? data.likes?.length ?? 0;

  const isRetweetedByCurrentUser = currentUserId
    ? data.retweets?.some((r) => r.authorId === currentUserId)
    : false;
  const retweetCount = data.retweets?.length ?? data._count?.retweets ?? 0;

  const replyCount = Math.max(data.totalReplies ?? 0, data._count?.replies ?? 0);

  const formattedDate = useMemo(() => {
    const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return createdAtDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }, [createdAt]);

  const formattedTime = useMemo(() => {
    const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return createdAtDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  }, [createdAt]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
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

  async function inlineImages(container: HTMLElement) {
    const images = container.querySelectorAll('img');
    const originals = new Map<HTMLImageElement, string>();

    await Promise.all(
      Array.from(images).map(async (img) => {
        if (!img.src || img.src.startsWith('data:')) return;
        if (img.src.startsWith(window.location.origin)) return;
        try {
          originals.set(img, img.src);
          const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(img.src)}`);
          const blob = await res.blob();
          img.src = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          /* keep original */
        }
      }),
    );

    return () =>
      originals.forEach((src, img) => {
        img.src = src;
      });
  }

  async function handleShareScreenshot(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!tweetRef.current || isSharing) return;

    let shareIcon: HTMLElement | null = null;
    let shareSpinner: HTMLElement | null = null;

    try {
      setIsSharing(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      shareIcon = tweetRef.current.querySelector('[data-share-icon]') as HTMLElement | null;
      shareSpinner = tweetRef.current.querySelector('[data-share-spinner]') as HTMLElement | null;

      if (shareIcon && shareSpinner) {
        shareSpinner.style.display = 'none';
        shareIcon.style.display = 'block';
      }

      const restore = await inlineImages(tweetRef.current);
      const blob = await domToBlob(tweetRef.current, { scale: 2, backgroundColor: '#0b0f14' });
      restore();

      if (shareIcon) shareIcon.style.display = '';
      if (shareSpinner) shareSpinner.style.display = '';

      if (!blob) return;

      const file = new File([blob], `tweet-${tweetId}.png`, { type: 'image/png' });

      const tweetUrl = `${window.location.origin}/tweet/${tweetId}`;

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Tweet by ${author?.name || 'User'}`,
            url: tweetUrl,
          });
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
        }
      }

      const link = document.createElement('a');
      link.download = `tweet-${tweetId}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to capture tweet screenshot:', error);
    } finally {
      if (shareIcon) shareIcon.style.display = '';
      if (shareSpinner) shareSpinner.style.display = '';
      setIsSharing(false);
    }
  }

  return (
    <div
      ref={tweetRef}
      className="flex flex-col my-4 sm:my-6 p-3 sm:p-4 border border-surface rounded-xl w-full"
    >
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
        <div className="shrink-0">
          {(currentUserId === data.authorId || isAdmin) && (
            <MoreTweetButton
              tweetId={data.id}
              onEdit={() => {
                setIsEditing(true);
                setValue('tweet', content);
                updateChar(content.length);
              }}
            />
          )}
        </div>
      </div>
      {isEditing ? (
        <form className="flex flex-col gap-2 mt-3 sm:mt-4" onSubmit={handleSubmit(onSubmit)}>
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
              dir="auto"
              disabled={isSubmitting}
              className={`${errors.tweet ? 'focus:outline-red-500 border-red-500' : 'focus:outline-white'} pt-3 pb-10 pl-3.5 pr-2 border border-border/60 rounded-md focus:outline-2 focus:-outline-offset-1 w-full font-normal text-white text-sm sm:text-base resize-y disabled:opacity-50`}
            />
            <CharLimit charLimit={500} />
            {errors.tweet && <p className="text-red-800 text-sm">{errors.tweet.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div
          dir="auto"
          className="mt-3 sm:mt-4 sm:text-[16px] text-sm text-start wrap-break-word leading-relaxed tracking-wide whitespace-pre-line"
        >
          {content}
          {data.mediaUrl && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                open(data.mediaUrl!);
              }}
              className="block mt-3 border border-border hover:border-white/30 rounded-xl transition duration-200 cursor-pointer overflow-hidden group"
            >
              <Image
                src={data.mediaUrl}
                alt="Tweet media"
                className="w-full max-h-112.5 h-auto rounded-xl object-cover group-hover:scale-[1.01] transition-transform duration-200"
                width={500}
                height={300}
                loading="eager"
                unoptimized
                crossOrigin="anonymous"
              />
            </div>
          )}
          {data.retweetOf ? (
            <div dir="ltr">
              <Link
                href={`/tweet/${data.retweetOf.tweetId || data.retweetOf.id}`}
                className="block mt-3 p-3 border border-border hover:border-white/30 rounded-xl transition duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`shrink-0 rounded-full outline-2 outline-surface-2 outline-offset-2 w-10 h-10 sm:w-12 sm:h-12 overflow-hidden ${bgGradient}`}
                  >
                    <Avatar
                      name={data.retweetOf.author?.name || 'User'}
                      image={data.retweetOf.author?.avatar}
                      size={24}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-left truncate">
                      {data.retweetOf.author?.name || 'User'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-text-muted text-xs sm:text-sm truncate">
                      <div className="truncate">@{data.retweetOf.author?.userName || 'user'}</div>
                      {data.retweetOf.author?.job && (
                        <div className="px-1.5 py-0.5 border border-text-subtle rounded-lg text-xs">
                          {data.retweetOf.author?.job}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {data.retweetOf.content && (
                  <p
                    dir="auto"
                    className="mt-3 sm:mt-4 sm:text-[16px] text-sm text-start wrap-break-word leading-relaxed tracking-wide whitespace-pre-line"
                  >
                    {data.retweetOf.content}
                  </p>
                )}
                {data.retweetOf.mediaUrl && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      open(data.retweetOf!.mediaUrl!);
                    }}
                    className="block mt-3 border border-border hover:border-white/30 rounded-xl transition duration-200 cursor-pointer overflow-hidden group"
                  >
                    <Image
                      src={data.retweetOf.mediaUrl}
                      alt="Retweet media"
                      className="w-full max-h-112.5 h-auto rounded-xl object-cover group-hover:scale-[1.01] transition-transform duration-200"
                      width={500}
                      height={300}
                      loading="eager"
                      unoptimized
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
              </Link>
            </div>
          ) : data.originalTweetDeleted ? (
            <div className="mt-3 p-3.5 border border-border/50 bg-white/5 rounded-xl text-text-muted text-sm italic flex items-center gap-2">
              <span>This post is unavailable because it was deleted.</span>
            </div>
          ) : null}
        </div>
      )}
      <div className="flex flex-row justify-between items-center mt-3 sm:mt-4 text-xs sm:text-sm">
        <div className="group flex items-center gap-1 text-text-muted">
          <span
            className={`duration-150 ${isRetweetedByCurrentUser ? 'text-green-500' : 'group-hover:text-green-500'}`}
          >
            {retweetCount > 0 ? retweetCount : ''}
          </span>
          <button
            type="button"
            aria-label="Retweet"
            className="bg-transparent hover:bg-green-500/10 p-1.5 border-0 rounded-full cursor-pointer"
            onClick={() => {
              openDrawer(data.id);
            }}
          >
            <Repeat2
              className={`w-4 sm:w-5 h-4 sm:h-5 duration-150 ${isRetweetedByCurrentUser ? 'text-green-500' : 'text-text-muted group-hover:text-green-500'}`}
            />
          </button>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <div className="group-hover:text-blue-500 duration-150">{replyCount}</div>
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
            className="bg-transparent hover:bg-red-500/10 p-1.5 border-0 rounded-full cursor-pointer"
          >
            <Heart
              fill={isLiked ? 'currentColor' : 'none'}
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'text-red-500' : 'text-text-muted group-hover:text-red-500'}`}
            />
          </button>
        </div>
        <div className="group flex items-center gap-1 text-text-muted">
          <button
            onClick={handleShareScreenshot}
            type="button"
            disabled={isSharing}
            aria-label="Share tweet"
            className="bg-transparent hover:bg-blue-500/10 p-1.5 border-0 rounded-full cursor-pointer disabled:opacity-50"
          >
            <Share2
              data-share-icon
              className={`w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-blue-500 duration-150 ${isSharing ? 'hidden' : 'block'}`}
            />
            {isSharing && (
              <Loader2
                data-share-spinner
                className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 animate-spin block"
              />
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-between items-end mt-2 pt-2 border-surface border-t text-text-muted text-xs sm:text-sm">
        <div className="flex items-center gap-1.5">
          <Image
            src="/icons/logo.svg"
            alt="Boblo"
            width={16}
            height={16}
            className="w-4 h-4 object-contain"
          />
          <span>Boblo</span>
          {data.parentId && <span className="text-text-muted">| Replied</span>}
          {(data.retweetOf || data.originalTweetDeleted) && (
            <span className="text-text-muted">| Reposted</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          {isEdited && <span className="italic">(edited)</span>}
          <span>
            {formattedTime} &middot; {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
