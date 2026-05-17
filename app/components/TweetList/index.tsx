import axios from 'axios';
import Tweet from '../Tweet';

export default async function TweetList() {
  const req = await fetch(`http://localhost:3000/api/tweet`);
  
  // Correctly parse the JSON response
  const tweets = await req.json(); 

  return (
    <div className="mx-auto max-w-xl">
      {tweets.map((tweet: any) => (
        <Tweet key={tweet.id} data={tweet} /> // Use tweet.id if that's the primary key
      ))}
    </div>
  );
}