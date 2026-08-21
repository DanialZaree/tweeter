'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { getGradientFromName } from '@/app/lib/avatar';
import { useImageModalStore } from '@/app/store/useImageModalStore';

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string | null;
  size?: number;
  expandable?: boolean;
}

export default function Avatar({
  name,
  image,
  size = 96,
  className = '',
  expandable = false,
}: AvatarProps) {
  const { open } = useImageModalStore();

  const bgGradient = useMemo(() => {
    return image ? 'bg-sky-500' : getGradientFromName(name);
  }, [name, image]);

  const initial = name?.charAt(0)?.toUpperCase() ?? 'U';

  const handleClick = (e: React.MouseEvent) => {
    if (expandable && image) {
      e.preventDefault();
      e.stopPropagation();
      open(image);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex justify-center items-center rounded-full overflow-hidden font-bold text-white shrink-0 w-full h-full ${
        expandable && image ? 'cursor-pointer hover:opacity-95' : ''
      } ${bgGradient} ${className}`}
      style={{
        fontSize: `${size / 2.5}px`,
      }}
    >
      {image ? (
        <Image
          src={image}
          width={size}
          height={size}
          loading="eager"
          alt={name ?? 'Avatar'}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
