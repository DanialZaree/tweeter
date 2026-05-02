import axios from 'axios';
import Tweet from '../Tweet';

export default async function TweetList() {
  const req = await axios.get(`http://localhost:3000/api/tweets`);
  const tweets = req.data;

  return (
    <div className="mx-auto max-w-xl">
      {tweets.map((tweet: any) => (
        <Tweet key={tweet._id} data={tweet} />
      ))}
    </div>
  );
}
