import { useMemo } from 'react';
import Image from 'next/image';
import { getGradientFromName } from '@/app/lib/avatar';

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string | null;
  size?: number;
}

export default function Avatar({ name, image, size = 96, className = '' }: AvatarProps) {
  const bgGradient = useMemo(() => {
    return image ? 'bg-sky-500' : getGradientFromName(name);
  }, [name, image]);

  const initial = name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div
      className={`flex justify-center items-center border-4 border-black rounded-full overflow-hidden font-bold text-white shrink-0 ${bgGradient} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size / 2.5}px`, // Scales the letter automatically
      }}
    >
      {image ? (
        <Image
          src={image}
          width={size}
          height={size}
          alt={name ?? 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
