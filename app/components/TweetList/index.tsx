import Tweet from '../Tweet';

export default function TweetList({
  success,
  tweets,
  error,
}: {
  success: boolean;
  tweets: any[];
  error: string | undefined;
}) {
  if (!success) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {tweets?.map((tweet: any) => (
        <Tweet key={tweet.id} data={tweet} />
      ))}
    </div>
  );
}
