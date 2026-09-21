'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Plus, X, Loader2, MessageSquareDashed, Bell } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { ConversationListItem, ChatUser } from '../types';
import { searchUsers } from '@/app/lib/actions/actionSearch';
import { getGradientFromName } from '@/app/lib/avatar';
import { usePusherChannel } from '@/hooks/use-pusher-channel';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';
import { useChatStore } from '../store';

interface ConversationListProps {
  conversations: ConversationListItem[];
  currentUserId?: string;
}

export default function ConversationList({
  conversations,
  currentUserId,
}: ConversationListProps) {
  const router = useRouter();
  const chatList = useChatStore((state) => state.conversations);
  const syncWithServer = useChatStore((state) => state.syncWithServer);
  const updateOnIncomingMessage = useChatStore((state) => state.updateOnIncomingMessage);
  const markConversationRead = useChatStore((state) => state.markConversationRead);
  const updateReadReceipt = useChatStore((state) => state.updateReadReceipt);

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isSubscribed: isPushSubscribed,
    isLoading: isLoadingPush,
    subscribe: subscribeToPush,
  } = usePushNotifications();
  const [hasDismissedPrompt, setHasDismissedPrompt] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, startTransition] = useTransition();

  // Keep state in sync with server props
  useEffect(() => {
    syncWithServer(conversations);
  }, [conversations, syncWithServer]);

  // Revalidate router cache on mount so back navigation displays freshest conversations
  useEffect(() => {
    router.refresh();
  }, [router]);

  // Real-time updates for conversation list (new messages, ordering, unread count)
  usePusherChannel<{
    conversationId: string;
    lastMessage: {
      text: string;
      createdAt: string;
      isSender: boolean;
      isRead: boolean;
    };
    unreadIncrement: boolean;
    participant?: ChatUser;
  }>(
    currentUserId ? `user-${currentUserId}` : null,
    'conversation:update',
    (update) => {
      if (!update) return;
      updateOnIncomingMessage({
        conversationId: update.conversationId,
        content: update.lastMessage.text,
        createdAt: update.lastMessage.createdAt,
        isSender: update.lastMessage.isSender,
        isRead: update.lastMessage.isRead,
        unreadIncrement: update.unreadIncrement,
        participant: update.participant,
      });
    },
  );

  // Real-time updates when messages in a conversation are marked as read
  usePusherChannel<{ conversationId: string; readerId: string }>(
    currentUserId ? `user-${currentUserId}` : null,
    'messages:read',
    (data) => {
      if (!data) return;
      if (data.readerId === currentUserId) {
        markConversationRead(data.conversationId);
      } else {
        updateReadReceipt(data.conversationId);
      }
    },
  );

  // Filter existing chats locally
  const filteredConversations = chatList.filter((conv) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = conv.participant.name?.toLowerCase().includes(q);
    const userMatch = conv.participant.userName?.toLowerCase().includes(q);
    const textMatch = conv.lastMessage?.text?.toLowerCase().includes(q);
    return nameMatch || userMatch || textMatch;
  });

  // Handle live search for new users
  const handleUserSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    startTransition(async () => {
      const res = await searchUsers(query);
      if (res.success && res.users) {
        setSearchResults(
          res.users
            .filter((u) => u.id !== currentUserId)
            .map((u) => ({
              id: u.id,
              name: u.name,
              userName: u.userName,
              avatar: u.avatar,
              isOnline: false,
            })),
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full w-full select-none">
      <div className="p-3.5 pb-2 pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Messages
            {chatList.length > 0 && (
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/90">
                {chatList.length}
              </span>
            )}
          </h1>
          <button
            type="button"
            onClick={() => {
              setIsNewChatOpen(!isNewChatOpen);
              setSearchQuery('');
              setSearchResults([]);
            }}
            title="New Chat"
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            {isNewChatOpen ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {/* Push Notification Banner for PWA Mobile & PC */}
        {isPushSupported && !isPushSubscribed && pushPermission !== 'denied' && !hasDismissedPrompt && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white">
            <div className="flex items-center gap-2 min-w-0">
              <Bell size={15} className="text-white shrink-0" />
              <span className="truncate text-white/90 font-medium">
                Enable alerts for new messages on PC & mobile
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={subscribeToPush}
                disabled={isLoadingPush}
                className="px-2.5 py-1 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors text-xs disabled:opacity-50 cursor-pointer"
              >
                {isLoadingPush ? 'Enabling...' : 'Enable'}
              </button>
              <button
                type="button"
                onClick={() => setHasDismissedPrompt(true)}
                className="p-1 text-muted-foreground hover:text-white rounded-md transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Telegram Search Input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleUserSearch(e.target.value)}
            placeholder={isNewChatOpen ? 'Search people to message...' : 'Search chats...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
        {/* User Search Mode (When New Chat is open or query is entered) */}
        {isNewChatOpen && (
          <div className="p-2">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isSearching ? 'Searching users...' : 'Start a new chat'}
            </div>
            {isSearching && (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
            {!isSearching && searchResults.length === 0 && searchQuery && (
              <p className="text-center py-6 text-sm text-muted-foreground">No users found</p>
            )}
            {searchResults.map((user) => {
              const avatarUrl = user.avatar || user.image;
              const initial = (user.name || user.userName || '?')[0].toUpperCase();
              const gradientClass = getGradientFromName(user.userName);

              return (
                <Link
                  key={user.id}
                  href={`/chat/${user.userName}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={user.name || user.userName || 'User'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'w-full h-full flex items-center justify-center font-bold text-white text-sm',
                          gradientClass,
                        )}
                      >
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.userName}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Regular Conversation List */}
        {!isNewChatOpen && (
          <>
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="p-3 bg-white/5 rounded-full mb-3 text-muted-foreground">
                  <MessageSquareDashed size={28} />
                </div>
                <p className="font-medium text-white text-sm">No conversations</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {searchQuery
                    ? 'No chats match your search query.'
                    : 'Tap the plus button above to start your first chat!'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => <ConversationItem key={conv.id} item={conv} />)
            )}
          </>
        )}
      </div>
    </div>
  );
}
