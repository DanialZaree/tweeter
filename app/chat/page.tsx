import type { Metadata } from 'next';
import Frame from '../components/Frame';
import Navbar from '../components/Navbar';
import { Lock } from 'lucide-react';
import { auth } from '../auth';
import SignInBtn from '../components/SignInBtn';
import ConversationList from '../components/Chat/ConversationList';
import { getConversations } from '../lib/actions/actionChat';
import { ConversationListItem } from '../components/Chat/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Private messages and chat on Boblo.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Chat() {
  const session = await auth();

  if (!session?.user) {
    return (
      <>
        <Navbar />
        <Frame>
          <main className="flex flex-col items-center justify-center flex-1 h-[60vh] text-center gap-4 px-4">
            <div className="bg-surface p-6 rounded-full">
              <Lock size={48} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sign In Required</h1>
            <p className="text-muted-foreground max-w-sm mb-4">
              You need to be signed in to view your messages.
            </p>
            <SignInBtn />
          </main>
        </Frame>
      </>
    );
  }

  const { conversations = [] } = await getConversations();

  return (
    <>
      <Navbar />
      <div className="w-full px-0 sm:px-4">
        <div className="w-full h-[calc(100dvh-5.5rem)] max-w-2xl mx-auto overflow-hidden flex flex-col shadow-2xl relative">
          <ConversationList
            conversations={conversations as ConversationListItem[]}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </>
  );
}
