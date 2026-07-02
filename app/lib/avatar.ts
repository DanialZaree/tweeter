export function getGradientFromName(userName?: string | null): string {
  if (!userName) return 'bg-linear-to-br from-slate-300 to-slate-400';

  const gradients = [
    'bg-linear-to-br from-rose-400 via-fuchsia-500 to-indigo-500',
    'bg-linear-to-br from-cyan-400 via-blue-500 to-indigo-600',
    'bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-500',
    'bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500',
    'bg-linear-to-br from-amber-400 via-orange-500 to-rose-500',
    'bg-linear-to-br from-lime-400 via-emerald-500 to-teal-600',
    'bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500',
    'bg-linear-to-br from-yellow-400 via-orange-500 to-red-500',
  ];

  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
