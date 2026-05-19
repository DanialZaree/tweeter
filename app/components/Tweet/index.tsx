import Image from 'next/image';
import {
  MoreHorizontal,
  Repeat2,
  Heart,
  ChartNoAxesColumnIcon,
  MessageCircle,
  Bird,
} from 'lucide-react';

interface TweetType {
  data: {
    _id: string;
    authorId: string;
    content: string;
    createdAt: Date | string;
    author: {
      id: string;
      name: string;
      createdAt: Date | string;
      job: string;
      avatar: '';
      userName: string;
    };
  };
}

export default function Tweet({ data }: TweetType) {
  const { _id, authorId, content, createdAt, author } = data;
  const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const formattedDate: string = createdAtDate.toLocaleDateString('en-US', options);

  return (
    <div className="flex flex-col my-6 p-4 border border-surface rounded-xl w-full transition hover:-translate-y-0.5 duration-300">
      <div className="flex justify-between">
        <div className="flex flex-row gap-3">
          <div className="rounded-full outline-2 outline-border outline-offset-2 w-12 h-12 overflow-hidden">
            <Image
              alt="user-profile"
              src={author.avatar ? author.avatar : '/uploads/default.png'}
              width={48}
              height={48}
              loading="lazy"
              fetchPriority="auto"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div>{author.name}</div>
            <div className="flex flex-row items-center gap-1.5 text-text-muted text-sm">
              <div className="px-2 py-0.5 border border-text-subtle rounded-lg">{author.job}</div>
              <div>@{author.userName}</div>
            </div>
          </div>
        </div>
        <div>
          <MoreHorizontal className="text-text-muted hover:text-white" />
        </div>
      </div>
      <div className="mt-4 text-[16px] wrap-break-word leading-relaxed tracking-wide">
        {content}
      </div>
      <div className="flex flex-row justify-between mt-4">
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="hover:bg-green-500/10 p-1.5 rounded-full cursor-pointer">
            <Repeat2 className="text-text-muted group-hover:text-green-500 duration-150" />
          </div>
        </div>
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <div className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer">
            <MessageCircle
              size={20}
              className="text-text-muted group-hover:text-blue-500 duration-150"
            />
          </div>
        </div>
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="group-hover:text-red-500 duration-150">2</div>
          <div className="hover:bg-red-500/10 p-1.5 rounded-full cursor-pointer">
            <Heart size={20} className="text-text-muted group-hover:text-red-500 duration-150" />
          </div>
        </div>
        <div className="group flex items-center-safe gap-1 text-text-muted text-sm">
          <div className="group-hover:text-blue-500 duration-150">2</div>
          <div className="hover:bg-blue-500/10 p-1.5 rounded-full cursor-pointer">
            <ChartNoAxesColumnIcon
              size={20}
              className="text-text-muted group-hover:text-blue-500 duration-150"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-end mt-2 pt-2 border-surface border-t">
        <div className="flex items-end gap-1">
          <Bird />
          Tweeter
        </div>
        <div>{formattedDate}</div>
      </div>
    </div>
  );
}
