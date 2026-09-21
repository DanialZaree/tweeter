export interface ChatUser {
  id: string;
  name: string | null;
  userName: string | null;
  avatar: string | null;
  image?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: ChatUser;
  content: string;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  } | null;
  isRead: boolean;
  status?: 'sending' | 'sent' | 'seen' | 'error';
  isEdited?: boolean;
  createdAt: string | Date;
}

export interface ConversationListItem {
  id: string;
  participant: ChatUser;
  lastMessage?: {
    text: string;
    createdAt: string | Date;
    isSender: boolean;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

export interface ReplyContext {
  messageId: string;
  senderName: string;
  content: string;
}
