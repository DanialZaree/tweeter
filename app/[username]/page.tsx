import { notFound } from 'next/navigation';
import { getTweetByUserId } from '../lib/actions/tweet';
import { getUser } from '@/app/lib/actions/actionUser';
import TweetList from '../components/TweetList';
import Avatar from '../components/ui/Avatar';
import { getGradientFromName } from '../lib/avatar';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Tabs } from '@base-ui/react/tabs';

const tabClassName =
  'flex h-[calc(2rem+1px)] items-center justify-center bg-transparent px-2 py-0 font-inherit text-sm font-normal leading-5 break-keep cursor-pointer whitespace-nowrap text-neutral-600 outline-none select-none hover:text-neutral-950 data-active:text-neutral-950 dark:text-neutral-300 dark:hover:text-white dark:data-active:text-white';

const panelClassName =
  'col-start-1 row-start-1 flex w-full items-center justify-center bg-white p-4 text-center text-sm text-neutral-950 outline-none dark:bg-neutral-950 dark:text-white [&[hidden]]:hidden';

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;
  const user = await getUser({ userName: username });

  if (!user) notFound();

  const bgGradient = getGradientFromName(user?.userName);


    const { success, tweets, error } = await getTweetByUserId(user?.id ?? '');
    const safeTweets = tweets ?? [];
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="mx-auto border-white/10 border-x max-w-150">
        {/* Top nav */}
        <div className="top-0 z-10 sticky flex items-center gap-6 bg-black/80 backdrop-blur-md px-4 py-3 border-white/10 border-b">
          <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="font-bold text-[17px] leading-tight">{user?.name ?? 'Profile'}</p>
            <p className="text-[13px] text-white/50"> posts</p>
          </div>
        </div>

        {/* Banner */}
        <div className={`relative  bg-linear-to-br ${bgGradient} w-full h-48`}>
          {/* Avatar */}
          <div className="-bottom-12 left-4 absolute rounded-full outline-4 outline-surface-2 outline-offset-2">
            <Avatar name={user?.name} image={user?.avatar} className="" />
          </div>
        </div>

        {/* Edit / Follow row */}
        <div className="flex justify-end items-center gap-2 px-4 pt-3 pb-0">
          <button className="hover:bg-white/10 px-4 py-1.5 border border-white/20 rounded-full font-bold text-[14px] transition-colors">
            Edit profile
          </button>
        </div>

        {/* Profile info */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-[20px] leading-tight">
              {user?.name ?? 'Jane Doe'}
            </span>
          </div>
          <p className="mt-0.5 text-[14px] text-white/50">@{user?.userName ?? 'janedoe'}</p>

          <p className="mt-3 text-[15px] text-white/90 leading-relaxed">
            {user?.bio ?? 'User to busy to write a bio :('}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[13px] text-white/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(user?.createdAt ?? new Date()).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex gap-5 mt-3 text-[14px]">
            <span>
              {/* Dynamic Following */}
              <span className="font-bold text-white">{user?._count?.following ?? 0}</span>
              <span className="ml-1 text-white/50">Following</span>
            </span>
            <span>
              {/* Dynamic Followers */}
              <span className="font-bold text-white">{user?._count?.followers ?? 0}</span>
              <span className="ml-1 text-white/50">Followers</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs.Root className="w-full" defaultValue="tweets">
          <Tabs.List className="z-1 relative flex gap-1 mx-auto -mb-4 p-1 border-3 border-border rounded-3xl w-fit">
            <Tabs.Tab className={tabClassName} value="tweets">
              Posts
            </Tabs.Tab>
            <Tabs.Tab className={tabClassName} value="replies">
              Replies
            </Tabs.Tab>
            <Tabs.Tab className={tabClassName} value="account">
              Account
            </Tabs.Tab>
            <Tabs.Indicator className="absolute top-1 bottom-1 left-0 -z-1 bg-surface/60 border-2 border-border rounded-2xl w-(--active-tab-width) translate-x-(--active-tab-left) transition-[translate,width] duration-150 ease-in-out" />
          </Tabs.List>
          <div className="grid grid-cols-1 w-full min-h-32">
            <Tabs.Panel className={panelClassName} value="tweets">
              {safeTweets?.length > 0 ? (
                <TweetList success={success} tweets={safeTweets} error={error} />
              ) : (
                <p>No Tweets :/</p>
              )}
            </Tabs.Panel>
            <Tabs.Panel className={panelClassName} value="replies">
              <p>Milestones and deadlines.</p>
            </Tabs.Panel>
            <Tabs.Panel className={panelClassName} value="account">
              <p>Profile and preferences.</p>
            </Tabs.Panel>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}
