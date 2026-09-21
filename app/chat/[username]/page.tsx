import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/app/auth';
import prisma from '@/app/lib/prisma';
import ChatRoom from '@/app/components/Chat/ActiveChat/ChatRoom';
import { getOrCreateConversation, getMessages } from '@/app/lib/actions/actionChat';

interface ChatPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Chat with @${username}`,
    description: `Private direct conversation with @${username} on Boblo.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function UserChatPage({ params }: ChatPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }

  const { username } = await params;

  const targetUser = await prisma.user.findUnique({
    where: {
      userName: username.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      userName: true,
      avatar: true,
      image: true,
    },
  });

  if (!targetUser) {
    notFound();
  }

  // Prevent users from chatting with themselves
  if (targetUser.id === session.user.id) {
    redirect('/chat');
  }

  const convRes = await getOrCreateConversation(targetUser.id);
  if (!convRes.success || !convRes.conversation) {
    notFound();
  }

  const messagesRes = await getMessages(convRes.conversation.id);

  return (
    <ChatRoom
      currentUserId={session.user.id}
      conversationId={convRes.conversation.id}
      participant={{
        id: targetUser.id,
        name: targetUser.name,
        userName: targetUser.userName,
        avatar: targetUser.avatar || targetUser.image,
        isOnline: false,
      }}
      initialMessages={messagesRes.messages || []}
    />
  );
}
