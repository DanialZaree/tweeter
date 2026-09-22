'use server';

import prisma from '../prisma';
import { auth } from '@/app/auth';
import { pusherServer } from '@/lib/pusher-server';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '../webpush';
import { checkRateLimit } from '@/app/lib/ratelimit';

export async function getConversations() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: 'Unauthorized', conversations: [] };

    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatar: true,
            image: true,
          },
        },
        messages: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const convIds = conversations.map((c) => c.id);
    const unreadGroups = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: convIds },
        senderId: { not: userId },
        isRead: false,
        isDeleted: false,
      },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadGroups.map((g) => [g.conversationId, g._count.id]));

    const items = conversations
      .filter((conv) => conv.participantIds.some((id) => id !== userId))
      .map((conv) => {
        const otherUser = conv.participants.find((p) => p.id !== userId) ||
          conv.participants[0] || {
            id: 'unknown',
            name: 'Unknown User',
            userName: 'unknown',
            avatar: null,
            image: null,
          };

        const lastMsg = conv.messages[0];

        return {
          id: conv.id,
          participant: {
            id: otherUser.id,
            name: otherUser.name,
            userName: otherUser.userName,
            avatar: otherUser.avatar || otherUser.image,
            isOnline: false,
          },
          lastMessage: lastMsg
            ? {
                text: lastMsg.content,
                createdAt: lastMsg.createdAt.toISOString(),
                isSender: lastMsg.senderId === userId,
                isRead: lastMsg.isRead,
              }
            : null,
          unreadCount: unreadMap.get(conv.id) || 0,
        };
      });

    return { success: true, conversations: items };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: 'Failed to fetch conversations', conversations: [] };
  }
}

export async function getOrCreateConversation(targetUserId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: 'Unauthorized' };
    if (userId === targetUserId) {
      return { success: false, error: 'Cannot start a conversation with yourself' };
    }

    const rateCheck = await checkRateLimit(`chat:create:${userId}`, 20, 60);
    if (!rateCheck.success) {
      return {
        success: false,
        error: rateCheck.error || 'Rate limit exceeded. Please wait a bit.',
      };
    }

    // Find existing conversation between the two users
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [{ participantIds: { has: userId } }, { participantIds: { has: targetUserId } }],
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatar: true,
            image: true,
          },
        },
      },
    });

    if (existing) {
      return { success: true, conversation: existing };
    }

    // Create new conversation
    const newConv = await prisma.conversation.create({
      data: {
        participantIds: [userId, targetUserId],
        lastMessageAt: new Date(),
        lastMessageText: null,
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatar: true,
            image: true,
          },
        },
      },
    });

    // Also link to user records if needed
    await prisma.user
      .update({
        where: { id: userId },
        data: { conversationIds: { push: newConv.id } },
      })
      .catch(() => {});

    await prisma.user
      .update({
        where: { id: targetUserId },
        data: { conversationIds: { push: newConv.id } },
      })
      .catch(() => {});

    return { success: true, conversation: newConv };
  } catch (error) {
    console.error('Error creating/fetching conversation:', error);
    return { success: false, error: 'Failed to access conversation' };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: 'Unauthorized', messages: [] };

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatar: true,
            image: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    // Mark unread messages sent to this user as read
    await markMessagesAsRead(conversationId);

    const formatted = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      sender: {
        id: m.sender.id,
        name: m.sender.name,
        userName: m.sender.userName,
        avatar: m.sender.avatar || m.sender.image,
      },
      content: m.content,
      replyToId: m.replyToId,
      replyTo: m.replyTo
        ? {
            id: m.replyTo.id,
            senderName: m.replyTo.sender.name || `@${m.replyTo.sender.userName}` || 'User',
            content: m.replyTo.content,
          }
        : null,
      isRead: m.senderId === userId ? m.isRead : true,
      isEdited: m.isEdited,
      createdAt: m.createdAt.toISOString(),
    }));

    return { success: true, messages: formatted };
  } catch (error) {
    console.error('Error getting messages:', error);
    return { success: false, error: 'Failed to fetch messages', messages: [] };
  }
}

export async function markMessagesAsRead(conversationId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: 'Unauthorized' };

    const updateRes = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    if (updateRes.count > 0) {
      try {
        await pusherServer.trigger(`conversation-${conversationId}`, 'messages:read', {
          conversationId,
          readerId: userId,
        });

        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { participantIds: true },
        });

        if (conv?.participantIds) {
          for (const pId of conv.participantIds) {
            await pusherServer.trigger(`user-${pId}`, 'messages:read', {
              conversationId,
              readerId: userId,
            });
          }
        }
      } catch (pushErr) {
        console.error('Pusher trigger error on messages:read:', pushErr);
      }
      revalidatePath('/chat');
    }

    return { success: true, count: updateRes.count };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, error: 'Failed to mark messages as read' };
  }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  replyToId?: string | null,
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: 'Unauthorized' };

    const rateCheck = await checkRateLimit(`chat:send:${userId}`, 30, 60);
    if (!rateCheck.success) {
      return {
        success: false,
        error: rateCheck.error || 'Rate limit exceeded. Please wait a moment before sending again.',
      };
    }

    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: 'Message cannot be empty' };

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: trimmed,
        replyToId: replyToId || null,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatar: true,
            image: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    // Update conversation last message
    const updatedConv = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: trimmed,
      },
      select: {
        id: true,
        participantIds: true,
      },
    });

    const payload = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        userName: message.sender.userName,
        avatar: message.sender.avatar || message.sender.image,
      },
      content: message.content,
      replyToId: message.replyToId,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            senderName:
              message.replyTo.sender.name || `@${message.replyTo.sender.userName}` || 'User',
            content: message.replyTo.content,
          }
        : null,
      isRead: false,
      createdAt: message.createdAt.toISOString(),
    };

    // 1. Pusher broadcast in conversation room
    try {
      await pusherServer.trigger(`conversation-${conversationId}`, 'message:new', payload);
    } catch (pushErr) {
      console.error('Pusher trigger error in chat:', pushErr);
    }

    // 2. Pusher broadcast to each participant's inbox channel for instant chat list updates
    for (const pId of updatedConv.participantIds) {
      try {
        await pusherServer.trigger(`user-${pId}`, 'conversation:update', {
          conversationId,
          lastMessage: {
            text: trimmed,
            createdAt: message.createdAt.toISOString(),
            isSender: pId === userId,
            isRead: false,
          },
          unreadIncrement: pId !== userId,
          participant: {
            id: message.sender.id,
            name: message.sender.name,
            userName: message.sender.userName,
            avatar: message.sender.avatar || message.sender.image,
          },
        });
      } catch (userPushErr) {
        console.error('Pusher error on user inbox channel:', userPushErr);
      }
    }

    // 3. Web Push notification to mobile and PC PWA for other participants
    const senderDisplayName =
      message.sender.name || `@${message.sender.userName}` || 'New Message';
    let senderAvatar = message.sender.avatar || message.sender.image || '/icons/icon-192x192.png';
    try {
      const avatarUrl = new URL(senderAvatar);
      if (avatarUrl.hostname === 'res.cloudinary.com' && avatarUrl.pathname.includes('/upload/')) {
        senderAvatar = senderAvatar.replace('/upload/', '/upload/w_192,h_192,c_fill,r_max/');
      }
    } catch {}

    const pushBody = trimmed.length > 100 ? `${trimmed.slice(0, 97)}...` : trimmed;
    const chatUrl = message.sender.userName ? `/chat/${message.sender.userName}` : '/chat';

    for (const pId of updatedConv.participantIds) {
      if (pId !== userId) {
        sendPushNotification(pId, {
          title: senderDisplayName,
          body: pushBody,
          url: chatUrl,
          icon: senderAvatar,
          badge: '/icons/logo.svg',
        }).catch((pushErr) => {
          console.error('Push notification send error:', pushErr);
        });
      }
    }

    revalidatePath('/chat');
    return { success: true, message: payload };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function sendTypingStatus(conversationId: string, isTyping: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId || !conversationId) return { success: false };

    await pusherServer.trigger(`conversation-${conversationId}`, 'user:typing', {
      userId,
      isTyping,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending typing status:', error);
    return { success: false };
  }
}

export async function sendPresencePing(
  conversationId: string,
  status: 'online' | 'offline',
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId || !conversationId) return { success: false };

    await pusherServer.trigger(`conversation-${conversationId}`, 'user:presence', {
      userId,
      status,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending presence ping:', error);
    return { success: false };
  }
}

