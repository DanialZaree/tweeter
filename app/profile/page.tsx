import { showProfile } from '../lib/actions/actionProfile';
import { MapPin, Link, Calendar, Mail, MessageCircle, Repeat2, Heart, BarChart2, Upload, BadgeCheck } from 'lucide-react';
 
const mockTweets = [
  {
    id: 1,
    text: 'Just shipped a new feature using Next.js Server Components + Prisma. The DX is insane — no API routes, no serialization boilerplate. Just data straight to your component 🚀',
    time: '2h',
    replies: 42,
    retweets: 138,
    likes: 1200,
    views: 28000,
  },
  {
    id: 2,
    text: 'Hot take: async Server Components are the best thing to happen to React since hooks. Fetching data right in your component tree — just await and you\'re done.',
    time: '1d',
    replies: 91,
    retweets: 304,
    likes: 3800,
    views: 61000,
  },
  {
    id: 3,
    text: 'Reminder: Server Actions are for mutations, not reads. For data fetching, call your DB/ORM directly in an async server component. Cleaner, faster, more idiomatic.',
    time: '3d',
    replies: 57,
    retweets: 210,
    likes: 2100,
    views: 44000,
  },
];
 
function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}
 
function getInitials(name: string | null | undefined) {
  if (!name) return 'U';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
 
export default async function Profile() {
  const user = await showProfile();
 
  const tabs = ['Posts', 'Replies', 'Media', 'Likes'];
 
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="mx-auto border-white/10 border-x max-w-[600px]">
 
        {/* Top nav */}
        <div className="top-0 z-10 sticky flex items-center gap-6 bg-black/80 backdrop-blur-md px-4 py-3 border-white/10 border-b">
          <button className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="font-bold text-[17px] leading-tight">{user?.name ?? 'Profile'}</p>
            <p className="text-[13px] text-white/50">{mockTweets.length} posts</p>
          </div>
        </div>
 
        {/* Banner */}
        <div className="relative bg-gradient-to-br from-sky-500 via-sky-400 to-blue-600 h-[200px]">
          {/* Avatar */}
          <div className="-bottom-12 left-4 absolute">
            <div className="flex justify-center items-center bg-sky-500 border-4 border-black rounded-full w-[96px] h-[96px] overflow-hidden font-bold text-white text-2xl">
              {user?.image ? (
                <img src={user.image} alt={user.name ?? 'avatar'} className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
          </div>
        </div>
 
        {/* Edit / Follow row */}
        <div className="flex justify-end items-center gap-2 px-4 pt-3 pb-0">
          <button className="hover:bg-white/10 p-2 border border-white/20 rounded-full transition-colors">
            <Mail className="w-4 h-4" />
          </button>
          <button className="hover:bg-white/10 px-4 py-1.5 border border-white/20 rounded-full font-bold text-[14px] transition-colors">
            Edit profile
          </button>
        </div>
 
        {/* Profile info */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-[20px] leading-tight">{user?.name ?? 'Jane Doe'}</span>
            <BadgeCheck className="fill-sky-400 w-5 h-5 text-sky-400" />
          </div>
          <p className="mt-0.5 text-[14px] text-white/50">@{user?.email?.split('@')[0] ?? 'janedoe'}</p>
 
          <p className="mt-3 text-[15px] text-white/90 leading-relaxed">
            Full-stack engineer · Building with Next.js &amp; Prisma · Open source enthusiast · coffee → code
          </p>
 
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[13px] text-white/50">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> San Francisco, CA
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <Link className="w-3.5 h-3.5" /> github.com/janedoe
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined March 2019
            </span>
          </div>
 
          <div className="flex gap-5 mt-3 text-[14px]">
            <span>
              <span className="font-bold text-white">1,240</span>
              <span className="ml-1 text-white/50">Following</span>
            </span>
            <span>
              <span className="font-bold text-white">48.2K</span>
              <span className="ml-1 text-white/50">Followers</span>
            </span>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="flex border-white/10 border-b">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 py-4 text-[14px] font-medium relative transition-colors ${
                i === 0 ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab}
              {i === 0 && (
                <span className="bottom-0 left-1/2 absolute bg-sky-400 rounded-full w-14 h-1 -translate-x-1/2" />
              )}
            </button>
          ))}
        </div>
 
        {/* Tweets */}
        <div>
          {mockTweets.map((tweet) => (
            <article
              key={tweet.id}
              className="flex gap-3 hover:bg-white/[0.02] px-4 py-3 border-white/10 border-b transition-colors cursor-pointer"
            >
              <div className="flex flex-shrink-0 justify-center items-center bg-sky-500 rounded-full w-10 h-10 font-bold text-[13px] text-white">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[15px]">{user?.name ?? 'Jane Doe'}</span>
                  <BadgeCheck className="fill-sky-400 w-4 h-4 text-sky-400" />
                  <span className="text-[14px] text-white/50">@{user?.email?.split('@')[0] ?? 'janedoe'}</span>
                  <span className="text-[14px] text-white/50">· {tweet.time}</span>
                </div>
                <p className="mt-1 text-[15px] text-white/90 leading-relaxed">{tweet.text}</p>
                <div className="flex justify-between items-center mt-3 max-w-[340px] text-white/50">
                  <button className="group flex items-center gap-1.5 text-[13px] hover:text-sky-400 transition-colors">
                    <span className="group-hover:bg-sky-400/10 p-1.5 rounded-full transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </span>
                    {formatCount(tweet.replies)}
                  </button>
                  <button className="group flex items-center gap-1.5 text-[13px] hover:text-green-400 transition-colors">
                    <span className="group-hover:bg-green-400/10 p-1.5 rounded-full transition-colors">
                      <Repeat2 className="w-4 h-4" />
                    </span>
                    {formatCount(tweet.retweets)}
                  </button>
                  <button className="group flex items-center gap-1.5 text-[13px] hover:text-pink-400 transition-colors">
                    <span className="group-hover:bg-pink-400/10 p-1.5 rounded-full transition-colors">
                      <Heart className="w-4 h-4" />
                    </span>
                    {formatCount(tweet.likes)}
                  </button>
                  <button className="group flex items-center gap-1.5 text-[13px] hover:text-sky-400 transition-colors">
                    <span className="group-hover:bg-sky-400/10 p-1.5 rounded-full transition-colors">
                      <BarChart2 className="w-4 h-4" />
                    </span>
                    {formatCount(tweet.views)}
                  </button>
                  <button className="group flex items-center gap-1.5 text-[13px] hover:text-sky-400 transition-colors">
                    <span className="group-hover:bg-sky-400/10 p-1.5 rounded-full transition-colors">
                      <Upload className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
 
      </div>
    </div>
  );
}
 
