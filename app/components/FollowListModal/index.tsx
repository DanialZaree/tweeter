'use client';

import { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Avatar from '@/app/components/ui/Avatar';
import { getFollowList, type FollowListUser } from '@/app/lib/actions/actionFollowList';
import { cn } from '@/lib/utils';

type Tab = 'followers' | 'following';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab: Tab;
  followersCount: number;
  followingCount: number;
}

export default function FollowListModal({
  isOpen,
  onClose,
  userId,
  initialTab,
  followersCount,
  followingCount,
}: FollowListModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, FollowListUser[]>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCache({});
    }
  }, [isOpen, initialTab, userId]);

  useEffect(() => {
    if (!isOpen || cache[activeTab]) return;

    let active = true;
    setLoading(true);
    getFollowList(userId, activeTab)
      .then((data) => active && setCache((prev) => ({ ...prev, [activeTab]: data })))
      .catch(console.error)
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [isOpen, activeTab, cache, userId]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentList = cache[activeTab];
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'followers', label: 'Followers', count: followersCount },
    { id: 'following', label: 'Following', count: followingCount },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 touch-none overscroll-contain animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b0f14] border border-white/10 rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="font-bold text-[17px] text-white">People</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map(({ id, label, count }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="flex-1 flex justify-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div
                  className={cn(
                    'relative inline-flex items-center justify-center py-3.5 px-2 text-sm font-semibold transition-colors',
                    isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
                  )}
                >
                  <span>{label}</span>
                  <span className="ml-1.5 text-white/40 font-normal">{count}</span>
                  {isActive && (
                    <motion.span
                      layoutId="followModalTabUnderline"
                      className="absolute bottom-0 inset-x-0 h-1 bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {loading && !currentList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="text-white/40 animate-spin" />
              </div>
            ) : !currentList || currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/40">
                <Users size={32} />
                <p className="text-sm">
                  {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {currentList.map((user) => (
                  <Link
                    key={user.id}
                    href={`/${user.userName ?? ''}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 shrink-0">
                      <Avatar name={user.name} image={user.avatar} size={40} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-[14px] text-white truncate leading-tight">
                        {user.name ?? 'User'}
                      </span>
                      <span className="text-[13px] text-white/50 truncate leading-tight">
                        @{user.userName ?? 'user'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
