import { allTweets } from '@/app/lib/actions/tweet';
import Tweet from '../Tweet';

export default async function TweetList() {
  const { success, tweets, error } = await allTweets();

  if (!success) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto max-w-xl">
      {tweets?.map((tweet: any) => (
        <Tweet key={tweet.id} data={tweet} />
      ))}
    </div>
  );
}
