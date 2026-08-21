'use client';

import Image from 'next/image';
import { useImageModalStore } from '@/app/store/useImageModalStore';

interface CoverImageProps {
  src: string;
  alt?: string;
}

export default function CoverImage({ src, alt = 'Cover Image' }: CoverImageProps) {
  const { open } = useImageModalStore();

  return (
    <div
      onClick={() => open(src)}
      className="absolute inset-0 cursor-pointer hover:opacity-95 transition-opacity"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        crossOrigin="anonymous"
        priority
      />
    </div>
  );
}
