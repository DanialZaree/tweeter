'use client';

import { Reply, X } from 'lucide-react';
import { ReplyContext } from '../types';

interface ReplyPreviewProps {
  replyContext: ReplyContext;
  onCancel: () => void;
}

export default function ReplyPreview({ replyContext, onCancel }: ReplyPreviewProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-black/90 border-t border-white/10 text-xs animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <Reply size={18} className="text-white shrink-0" />
        <div className="flex items-stretch gap-2.5 min-w-0">
          <span className="w-[2.5px] rounded-full bg-white shrink-0 self-stretch my-0.5" />
          <div className="flex flex-col min-w-0 justify-center">
            <span className="font-semibold text-white truncate">
              Reply to {replyContext.senderName}
            </span>
            <span className="text-muted-foreground truncate max-w-sm">{replyContext.content}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        title="Cancel reply"
      >
        <X size={16} />
      </button>
    </div>
  );
}
