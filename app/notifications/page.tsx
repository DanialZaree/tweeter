import type { Metadata } from 'next';
import { auth } from '../auth';
import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar';
import Frame from '../components/Frame';
import NotificationList, { NotifItem } from '../components/NotifList';
import { getNotif } from '../lib/actions/actionNotif';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View and manage your Boblo notifications.',
  alternates: {
    canonical: '/notifications',
  },
  openGraph: {
    title: 'Notifications | Boblo',
    description: 'View and manage your Boblo notifications.',
    url: '/notifications',
  },
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth');
  }

  const { notifications } = await getNotif();

  return (
    <>
      <Navbar />
      <Frame>
        <main className="mx-auto w-full max-w-xl">
          <div className="mb-4">
            <h1 className="font-bold text-2xl text-white tracking-tight">Notifications</h1>
          </div>
          <NotificationList initialNotifications={notifications as unknown as NotifItem[]} />
        </main>
      </Frame>
    </>
  );
}
