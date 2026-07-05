import { notFound } from 'next/navigation';
import { getTweetById } from '@/app/lib/actions/tweet';
import Tweet from '@/app/components/Tweet';
import Frame from '@/app/components/Frame';
import Navbar from '@/app/components/Navbar';
import { auth } from '@/app/auth';

export default async function TweetPage({ params }: { params: Promise<{ tweet: string }> }) {
  const resolvedParams = await params;
  const tweetid = resolvedParams.tweet;

  const session = await auth();
  const currentUserId = session?.user?.id;

  try {
    const { tweet, success, error } = await getTweetById(tweetid);

    if (!success) {
      return (
        <Frame>
          <Navbar />
          <div className="mt-8 text-center text-red-500">{error}</div>
        </Frame>
      );
    }

    if (!tweet) notFound();
    
    return (
      <Frame>
        <Navbar />
        <div className="mt-4">
          <Tweet data={tweet} currentUserId={currentUserId} />
        </div>
      </Frame>
    );
  } catch (e) {
    return (
      <Frame>
        <Navbar />
        <div className="mt-8 text-center text-red-500">Failed to fetch tweet</div>
      </Frame>
    );
  }
}
