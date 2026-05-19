import axios from 'axios';
import Tweet from '../Tweet';

export default async function TweetList() {
  const req = await fetch(`http://localhost:3000/api/tweet`);
  const tweets = await req.json();

  if (!Array.isArray(tweets)) {
    return <div>Error loading tweets</div>;
  }

  return (
    <div className="mx-auto max-w-xl">
      {tweets.map((tweet: any) => (
        <Tweet key={tweet.id} data={tweet} />
      ))}
    </div>
  );
}
