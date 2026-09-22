import { create } from 'zustand';
import { ConversationListItem, ChatUser } from './types';

interface UpsertParams {
  conversationId: string;
  content: string;
  createdAt?: string;
  isSender?: boolean;
  isRead?: boolean;
  unreadIncrement?: boolean;
  participant?: ChatUser;
}

interface ChatStoreState {
  conversations: ConversationListItem[];
  setConversations: (items: ConversationListItem[]) => void;
  syncWithServer: (serverItems: ConversationListItem[]) => void;
  upsertMessage: (params: UpsertParams) => void;
  updateOnMessageSent: (params: { conversationId: string; content: string; createdAt?: string; participant?: ChatUser }) => void;
  updateOnIncomingMessage: (params: { conversationId: string; content: string; createdAt: string; isSender?: boolean; isRead?: boolean; unreadIncrement?: boolean; participant?: ChatUser }) => void;
  markConversationRead: (conversationId: string) => void;
  updateReadReceipt: (conversationId: string) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
}

export const useChatStore = create<ChatStoreState>((set) => {
  const upsert = ({
    conversationId,
    content,
    createdAt = new Date().toISOString(),
    isSender = false,
    isRead = false,
    unreadIncrement = false,
    participant,
  }: UpsertParams) =>
    set((state) => {
      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      const lastMessage = { text: content, createdAt, isSender, isRead };

      if (idx !== -1) {
        const existing = state.conversations[idx];
        const updated: ConversationListItem = {
          ...existing,
          lastMessage,
          unreadCount: isSender ? 0 : unreadIncrement ? (existing.unreadCount || 0) + 1 : existing.unreadCount,
        };
        return { conversations: [updated, ...state.conversations.filter((_, i) => i !== idx)] };
      }

      if (participant) {
        const newItem: ConversationListItem = {
          id: conversationId,
          participant: {
            id: participant.id,
            name: participant.name,
            userName: participant.userName,
            avatar: participant.avatar || participant.image || null,
            isOnline: participant.isOnline ?? false,
          },
          lastMessage,
          unreadCount: isSender ? 0 : unreadIncrement ? 1 : 0,
        };
        return { conversations: [newItem, ...state.conversations] };
      }

      return state;
    });

  return {
    conversations: [],

    setConversations: (items) => set({ conversations: items }),

    syncWithServer: (serverItems) =>
      set((state) => {
        if (!serverItems?.length) return { conversations: state.conversations };
        if (!state.conversations.length) return { conversations: serverItems };

        const merged = serverItems.map((server) => {
          const local = state.conversations.find((c) => c.id === server.id);
          if (!local?.lastMessage) return server;

          const serverT = server.lastMessage?.createdAt ? new Date(server.lastMessage.createdAt).getTime() : 0;
          const localT = new Date(local.lastMessage.createdAt).getTime();

          return localT >= serverT
            ? { ...server, lastMessage: local.lastMessage, unreadCount: local.unreadCount }
            : server;
        });

        for (const local of state.conversations) {
          if (!merged.some((m) => m.id === local.id)) merged.unshift(local);
        }

        merged.sort((a, b) => {
          const tA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const tB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return tB - tA;
        });

        return { conversations: merged };
      }),

    upsertMessage: upsert,

    updateOnMessageSent: (params) =>
      upsert({ ...params, isSender: true, isRead: false, unreadIncrement: false }),

    updateOnIncomingMessage: (params) => upsert(params),

    markConversationRead: (conversationId) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      })),

    updateReadReceipt: (conversationId) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId && c.lastMessage?.isSender
            ? { ...c, lastMessage: { ...c.lastMessage, isRead: true } }
            : c,
        ),
      })),

    setUserOnline: (userId, isOnline) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.participant.id === userId
            ? { ...c, participant: { ...c.participant, isOnline } }
            : c,
        ),
      })),
  };
});
