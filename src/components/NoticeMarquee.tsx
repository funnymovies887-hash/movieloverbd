import React from 'react';
import { Bell, Flame } from 'lucide-react';

interface NoticeMarqueeProps {
  announcement: string;
}

export const NoticeMarquee: React.FC<NoticeMarqueeProps> = ({ announcement }) => {
  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-y border-red-900/40 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden text-xs">
        <div className="flex items-center gap-1.5 bg-red-600 text-white font-bold px-2.5 py-1 rounded text-[11px] uppercase tracking-wider flex-shrink-0 shadow-sm shadow-red-600/50">
          <Flame className="w-3.5 h-3.5 animate-bounce" />
          <span>Notice</span>
        </div>
        <div className="overflow-hidden relative flex-1 text-slate-200">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-4">
            <span>{announcement}</span>
            <span className="text-red-500 font-bold">•</span>
            <span className="text-amber-300 font-medium">
              Join our Telegram for direct cloud links and uncompressed 4K prints!
            </span>
            <span className="text-red-500 font-bold">•</span>
            <span className="text-slate-300">
              Bookmark this domain: <strong className="text-white">MovieLover.baby</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
