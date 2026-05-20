import { notFound } from 'next/navigation';
import axios from 'axios';
import Tweet from '@/app/components/Tweet';

export default async function TweetPage({ params }: { params: Promise<{ tweet: string }> }) {
  const resolvedParams = await params;
  const tweetid = resolvedParams.tweet;

  try {
    const res = await axios.get(`http://localhost:3000/api/tweet/${tweetid}`);
    const tweet = res.data;

    if (!tweet) notFound();
    return (
      <div>
        <Tweet data={tweet} />
      </div>
    );
  } catch (e) {}
}
