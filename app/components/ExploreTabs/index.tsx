'use client';

import { Tabs } from '@base-ui/react/tabs';
import { TweetType } from '../Tweet';
import InfiniteTweetList from '../../components/InfiniteTweetList';

const tabClassName =
  'flex h-[calc(2rem+1px)] items-center justify-center bg-transparent px-2 py-0 font-inherit text-sm font-normal leading-5 break-keep cursor-pointer whitespace-nowrap text-neutral-600 outline-none select-none hover:text-neutral-950 data-active:text-neutral-950 dark:text-neutral-300 dark:hover:text-white dark:data-active:text-white';

const panelClassName =
  'col-start-1 row-start-1 flex w-full items-center justify-center text-center text-sm text-neutral-950 outline-none dark:text-white [&[hidden]]:hidden';

export default function ExploreTabs({
  allTweetsData,
  followingTweetsData,
  currentUserId,
  currentUserName,
  isLoggedIn,
}: {
  allTweetsData: { success: boolean; tweets?: TweetType['data'][]; error?: string; nextCursor?: string | null };
  followingTweetsData: { success: boolean; tweets?: TweetType['data'][]; error?: string; nextCursor?: string | null } | null;
  currentUserId?: string;
  currentUserName?: string;
  isLoggedIn: boolean;
}) {
  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-32">
        <InfiniteTweetList
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          feedType="everyone"
          initialTweets={allTweetsData.tweets}
          initialCursor={allTweetsData.nextCursor}
        />
      </div>
    );
  }

  return (
    <Tabs.Root className="w-full" defaultValue="everyone">
      <Tabs.List className="z-1 relative flex gap-1 mx-auto p-1 border-3 border-border rounded-3xl w-full sm:w-fit max-w-xs">
        <Tabs.Tab className={`${tabClassName} flex-1`} value="following">
          Following
        </Tabs.Tab>
        <Tabs.Tab className={`${tabClassName} flex-1`} value="everyone">
          Everyone
        </Tabs.Tab>
        <Tabs.Indicator className="absolute top-1 bottom-1 left-0 -z-1 bg-surface/60 border-2 border-border rounded-2xl w-(--active-tab-width) translate-x-(--active-tab-left) transition-[translate,width] duration-150 ease-in-out" />
      </Tabs.List>
      <div className="grid grid-cols-1 w-full min-h-32">
        <Tabs.Panel className={panelClassName} value="following">
          <InfiniteTweetList
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            feedType="following"
            targetUserId={currentUserId}
            initialTweets={followingTweetsData?.tweets}
            initialCursor={followingTweetsData?.nextCursor}
            emptyMessage={
              <div className="py-12 flex flex-col items-center justify-center text-text-muted">
                <p className="text-lg font-medium text-white">Welcome to your feed!</p>
                <p className="mt-2 text-sm text-center max-w-sm">
                  Follow people to see their posts here.
                </p>
                <div className="mt-4 text-sm">
                  Check out the <span className="font-semibold text-white">Everyone</span> tab to find
                  people to follow.
                </div>
              </div>
            }
          />
        </Tabs.Panel>
        <Tabs.Panel className={panelClassName} value="everyone">
          <InfiniteTweetList
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            feedType="everyone"
            initialTweets={allTweetsData.tweets}
            initialCursor={allTweetsData.nextCursor}
          />
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}

