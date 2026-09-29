import React from 'react';
import { Film, Send, ShieldAlert, Heart, DollarSign, Lock } from 'lucide-react';

interface FooterProps {
  siteName: string;
  telegramLink: string;
  onSelectCategory: (cat: string) => void;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
  onOpenRequest: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  siteName,
  telegramLink,
  onSelectCategory,
  onOpenAdmin,
  onOpenGuide,
  onOpenRequest
}) => {
  return (
    <footer className="bg-[#080d1a] border-t border-slate-800/80 pt-12 pb-24 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Col 1: Brand & Bio */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-['Teko'] uppercase leading-none">
              {siteName} <span className="text-red-500 text-sm">.baby</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Free High-Speed Movie & Web Series Download Portal. Providing 300MB, 720p, 1080p, and 4K UHD links with Google Drive & Direct Cloud mirrors.
          </p>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join Official Telegram</span>
          </a>
        </div>

        {/* Col 2: Movie Categories */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">
            Popular Categories
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => { onSelectCategory('bengali'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Bengali Blockbuster Movies
              </button>
            </li>
            <li>
              <button
                onClick={() => { onSelectCategory('south'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                South Indian Hindi Dubbed
              </button>
            </li>
            <li>
              <button
                onClick={() => { onSelectCategory('bollywood'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Bollywood 1080p & 720p Movies
              </button>
            </li>
            <li>
              <button
                onClick={() => { onSelectCategory('hollywood'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Hollywood Dual Audio (Hindi + English)
              </button>
            </li>
            <li>
              <button
                onClick={() => { onSelectCategory('webseries'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-red-400 transition-colors cursor-pointer"
              >
                Complete Hindi Web Series Packs
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={onOpenRequest}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Submit Movie Request
              </button>
            </li>
            <li>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors"
              >
                Report Broken Link
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: DMCA Disclaimer */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>DMCA & Legal Disclaimer</span>
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {siteName} does not host any media files or videos on its servers. All contents are indexed from freely available non-affiliated third-party platforms on the internet (Google Drive, HubCloud, etc). For copyright inquiries, please submit a notice.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
        <div>
          © {new Date().getFullYear()} {siteName}.baby — All Rights Reserved.
        </div>
        <div className="text-slate-400 flex items-center gap-4">
          <span>High-speed streaming & downloads</span>
          <button
            onClick={onOpenAdmin}
            id="footer-admin-secret-btn"
            className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 cursor-pointer p-1 rounded opacity-70 hover:opacity-100"
            aria-label="Admin Login"
          >
            <Lock className="w-3 h-3" />
            <span className="text-[10px]">Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
