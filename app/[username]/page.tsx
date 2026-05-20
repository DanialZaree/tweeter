import { notFound } from 'next/navigation';
import axios from 'axios';

async function GetUser(username: string) {
  try {
    const res = await axios.get(`http://localhost:3000/api/user/${username}`);
    return res.data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;
  const user = await GetUser(username);

  if (!user) notFound();

  return (
    <div className="mx-auto mt-10 p-6 border border-border/60 rounded-lg max-w-xl">
      <h1 className="font-bold text-white text-2xl">{user.name}</h1>
      <p className="text-gray-400">@{user.userName}</p>
      {user.job && <p className="mt-4 text-white">{user.job}</p>}
    </div>
  );
}
