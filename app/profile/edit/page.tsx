import { auth } from '@/app/auth';
import { showProfile } from '@/app/lib/actions/actionProfile';
import { redirect } from 'next/navigation';
import EditProfileForm from '@/app/components/EditProfileForm';

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await showProfile();
  if (!user) {
    redirect('/auth/signin');
  }

  return <EditProfileForm initialUser={user} />;
}
