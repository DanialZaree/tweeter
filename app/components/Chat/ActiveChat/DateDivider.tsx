'use client';

interface DateDividerProps {
  dateText: string;
}

export default function DateDivider({ dateText }: DateDividerProps) {
  return (
    <div className="relative flex items-center justify-center my-4 w-full select-none px-2">
      <div className="grow border-t border-white/10" />
      <span className="shrink-0 px-3 text-xs tracking-wider text-muted-foreground font-medium bg-transparent">
        {dateText}
      </span>
      <div className="grow border-t border-white/10" />
    </div>
  );
}
