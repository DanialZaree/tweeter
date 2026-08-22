import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTweetById } from '@/app/lib/actions/tweet';
import Tweet from '@/app/components/Tweet';
import Frame from '@/app/components/Frame';
import Navbar from '@/app/components/Navbar';
import NewTweetForm from '@/app/components/NewTweetForm';
import NewTweet from '@/app/components/ui/NewTweet';
import { auth } from '@/app/auth';

type TweetPageProps = {
  params: Promise<{ tweet: string }>;
};

export async function generateMetadata({ params }: TweetPageProps): Promise<Metadata> {
  const { tweet: tweetParam } = await params;
  const { tweet } = await getTweetById(tweetParam);

  if (!tweet) {
    return {
      title: 'Post Not Found',
      description: 'The requested post does not exist or has been removed on Boblo.',
    };
  }

  const authorName = tweet.author?.name || tweet.author?.userName || 'User';
  const authorHandle = tweet.author?.userName || 'user';
  const rawText = tweet.content || '';
  const snippet = rawText.length > 60 ? `${rawText.slice(0, 57)}...` : rawText;
  const title = snippet ? `${authorName}: "${snippet}"` : `Post by ${authorName}`;
  const description = rawText
    ? `${authorName} (@${authorHandle}): ${rawText}`
    : `View post by ${authorName} on Boblo.`;
  const canonicalUrl = `/tweet/${tweet.tweetId || tweet.id}`;

  const image = tweet.mediaUrl || tweet.author?.avatar;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: `${title} | Boblo`,
      description,
      url: canonicalUrl,
      publishedTime: tweet.createdAt ? new Date(tweet.createdAt).toISOString() : undefined,
      authors: [authorName],
      images: image ? [{ url: image, alt: snippet || `${authorName}'s post` }] : [],
    },
    twitter: {
      card: tweet.mediaUrl ? 'summary_large_image' : 'summary',
      title: `${title} | Boblo`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function TweetPage({ params }: TweetPageProps) {
  const resolvedParams = await params;
  const tweetid = resolvedParams.tweet;

  const session = await auth();
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.userName;

  const { tweet, success, error } = await getTweetById(tweetid);

  if (!success) {
    return (
      <>
        <Navbar />
        <Frame>
          <div className="mt-8 text-red-500 text-center">{error}</div>
        </Frame>
      </>
    );
  }

  if (!tweet) notFound();

  const totalReplies =
    tweet.totalReplies ??
    tweet.replies?.reduce((acc, r) => acc + 1 + (r._count?.replies ?? 0), 0) ??
    tweet._count?.replies ??
    0;

  return (
    <>
      <Navbar />
      <Frame>
        <div className="mt-4">
          <Tweet data={tweet} currentUserId={currentUserId} currentUserName={currentUserName} />
          {currentUserId ? (
            <div className="mt-4 p-4 border border-surface rounded-xl bg-surface/30">
              <h3 className="mb-3 font-medium text-text-muted text-sm">
                Replying to <span className="text-sky-400">@{tweet.author.userName || 'user'}</span>
              </h3>
              <NewTweetForm parentId={tweet.id} />
            </div>
          ) : (
            <div className="mt-4 p-4 border border-surface rounded-xl bg-surface/20 text-center text-text-muted text-sm">
              <Link href="/auth" className="text-sky-400 underline hover:text-sky-300">
                Sign in
              </Link>{' '}
              to reply
            </div>
          )}
          {tweet.replies && tweet.replies.length > 0 && (
            <div className="flex flex-col mt-6">
              <p className="mb-2 px-1 font-semibold text-text-muted text-sm">
                {totalReplies} {totalReplies === 1 ? 'Reply' : 'Replies'}
              </p>
              {tweet.replies.map((reply) => (
                <Tweet
                  key={reply.id}
                  data={reply}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          )}
          {tweet.replies?.length === 0 && (
            <p className="mt-8 text-center text-text-muted text-sm">
              No replies yet. Be the first!
            </p>
          )}
        </div>
        {session?.user && <NewTweet />}
      </Frame>
    </>
  );
}
