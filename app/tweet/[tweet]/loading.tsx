import Frame from '@/app/components/Frame';
import Navbar from '@/app/components/Navbar';
import TweetSkeleton from '@/app/components/Tweet/TweetSkeleton';

export default function TweetLoading() {
  return (
    <>
      <Navbar />
      <Frame>
        <div className="mt-4">
          <TweetSkeleton />
          <div className="mt-4">
            <TweetSkeleton />
          </div>
        </div>
      </Frame>
    </>
  );
}
