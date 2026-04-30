import Navbar from './components/Navbar';
import Frame from './components/Frame';
import TweetList from './components/TweetList';
import Test from './components/Test';
import { Suspense } from 'react';

export default function Home() {
  return (
    <>
      <Frame>
        <Navbar />
        <Suspense  fallback={<div>Loading tweets...</div>}>
          <TweetList />
        </Suspense>
        <Test />
      </Frame>
    </>
  );
}
