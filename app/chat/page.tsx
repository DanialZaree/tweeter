import Frame from '../components/Frame';
import Navbar from '../components/Navbar';
import { MessageCircle, Lock } from 'lucide-react';
import { auth } from '../auth';
import SignInBtn from '../components/SignInBtn';

export default async function Chat() {
  const session = await auth();
  return (
    <>
      <Navbar />
      <Frame>
        <main className="flex flex-col items-center justify-center flex-1 h-[60vh] text-center gap-4 px-4">
          {!session ? (
            <>
              <div className="bg-surface p-6 rounded-full">
                <Lock size={48} className="text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Sign In Required</h1>
              <p className="text-muted-foreground max-w-sm mb-4">
                You need to be signed in to view your messages.
              </p>
              <SignInBtn />
            </>
          ) : (
            <>
              <div className="bg-surface p-6 rounded-full">
                <MessageCircle size={48} className="text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Coming Soon</h1>
            </>
          )}
        </main>
      </Frame>
    </>
  );
}
