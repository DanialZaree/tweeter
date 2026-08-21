'use client';

import { useEffect } from 'react';
import { useImageModalStore } from '@/app/store/useImageModalStore';
import { X } from 'lucide-react';

export default function ImageModal() {
  const { src, close } = useImageModalStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    if (src) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [src, close]);

  if (!src) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close preview"
        className="top-4 right-4 sm:top-6 sm:right-6 absolute bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white cursor-pointer transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <img
        src={src}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl cursor-default"
      />
    </div>
  );
}
