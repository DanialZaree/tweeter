import { ReactNode } from 'react';

interface FrameProps {
  children: ReactNode;
}

export default function Frame({ children }: FrameProps) {
  return <section className="w-full max-w-2xl mx-auto px-3 sm:px-6">{children}</section>;
}
