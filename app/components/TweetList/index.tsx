import Tweet, { TweetType } from '../Tweet';

export default function TweetList({
  success,
  tweets,
  error,
  currentUserId,
  currentUserName,
}: {
  success: boolean;
  tweets: TweetType['data'][];
  error: string | undefined;
  currentUserId?: string;
  currentUserName?: string;
}) {
  if (!success) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {tweets?.map((tweet: any) => (
        <Tweet
          key={tweet.id}
          data={tweet}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      ))}
    </div>
  );
}
