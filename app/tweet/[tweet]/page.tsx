import { notFound } from 'next/navigation';
import { getTweetById } from '@/app/lib/actions/tweet';
import Tweet from '@/app/components/Tweet';

export default async function TweetPage({ params }: { params: Promise<{ tweet: string }> }) {
  const resolvedParams = await params;
  const tweetid = resolvedParams.tweet;

  try {
    const { tweet, success, error } = await getTweetById(tweetid);

    if (!success) {
      return <div>{error}</div>;
    }

    if (!tweet) notFound();
    return (
      <div>
        <Tweet data={tweet} />
      </div>
    );
  } catch (e) {
    return <div>Failed to fetch tweet</div>;
  }
}
