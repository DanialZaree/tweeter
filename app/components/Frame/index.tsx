import { ReactNode } from 'react';

interface FrameProps {
  children: ReactNode;
}

export default function Frame({ children }: FrameProps) {
  return <section className="w-2xl mx-auto">{children}</section>;
}
