import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';
import { recordAdImpression } from '../utils/storage';

interface AdSlotProps {
  id: string;
  type: 'header-728x90' | 'footer-sticky' | 'download-banner' | 'sidebar-300x250';
  customHtml?: string;
  testAdsMode?: boolean;
  onAdClicked?: () => void;
  directLinkUrl?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  id,
  type,
  customHtml,
  testAdsMode = true,
  onAdClicked,
  directLinkUrl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Track CPM Impression when Ad becomes visible
  useEffect(() => {
    if (hasTrackedImpression) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedImpression) {
            setHasTrackedImpression(true);
            recordAdImpression();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasTrackedImpression]);

  // Execute custom ad script tags safely if injected
  useEffect(() => {
    if (!customHtml || !containerRef.current) return;
    
    // Clear previous custom content
    containerRef.current.innerHTML = '';

    const container = containerRef.current;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = customHtml;

    // Extract scripts and execute them
    const scripts = tempDiv.getElementsByTagName('script');
    const scriptsArray = Array.from(scripts);

    // Append non-script content first
    while (tempDiv.firstChild) {
      if (tempDiv.firstChild.nodeName !== 'SCRIPT') {
        container.appendChild(tempDiv.firstChild);
      } else {
        tempDiv.removeChild(tempDiv.firstChild);
      }
    }

    // Execute scripts dynamically
    scriptsArray.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      container.appendChild(newScript);
    });
  }, [customHtml]);

  if (isDismissed) return null;

  // Handle click on the ad (triggers direct link or custom handler)
  const handleBannerClick = () => {
    if (onAdClicked) onAdClicked();
    if (directLinkUrl && directLinkUrl.startsWith('http')) {
      window.open(directLinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // If custom HTML script is provided, render it in a clean container
  if (customHtml && customHtml.trim().length > 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center my-3 relative overflow-hidden">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1 flex items-center gap-1">
          <span>Sponsored Advertisement (CPM)</span>
        </div>
        <div ref={containerRef} className="w-full max-w-full overflow-hidden flex justify-center" />
      </div>
    );
  }

  // Otherwise, if testAdsMode is active, display the styled high-CTR simulated banner
  if (!testAdsMode) return null;

  // 1. Header 728x90 Leaderboard
  if (type === 'header-728x90') {
    return (
      <div
        ref={containerRef}
        id={id}
        onClick={handleBannerClick}
        className="w-full max-w-4xl mx-auto my-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-xl p-3 shadow-lg hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-1 right-2 text-[9px] uppercase tracking-wider text-indigo-400/80 font-bold flex items-center gap-1">
          <span>Sponsored</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
              4K
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  HIGH SPEED CLOUD
                </span>
                <span className="text-xs text-indigo-300 font-semibold">Unlimited Bandwidth</span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                Stream & Download Latest Movies at 100MB/s Speed!
              </h4>
              <p className="text-xs text-slate-400">
                Zero waiting time • Direct Google Drive Mirrors • Mobile & TV compatible
              </p>
            </div>
          </div>

          <button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-md shadow-red-600/30 whitespace-nowrap transform group-hover:scale-105 transition-all">
            Download Fast →
          </button>
        </div>
      </div>
    );
  }

  // 2. Sticky Footer Banner
  if (type === 'footer-sticky') {
    return (
      <div
        ref={containerRef}
        id={id}
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-red-900/40 p-2 shadow-2xl"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div
            onClick={handleBannerClick}
            className="flex-1 flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0">
              HD
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">
                  Sponsored Fast Mirror
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">• Free Instant Access</span>
              </div>
              <p className="text-xs font-bold text-slate-100 truncate group-hover:text-red-400 transition-colors">
                ⚡ Download Latest Movies in 1080p 60FPS Direct Link!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBannerClick}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow whitespace-nowrap cursor-pointer"
            >
              Get Free Link
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md bg-slate-800/80 cursor-pointer"
              title="Close Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Download Page Banner (Above download links)
  if (type === 'download-banner') {
    return (
      <div
        ref={containerRef}
        id={id}
        onClick={handleBannerClick}
        className="w-full my-4 bg-gradient-to-r from-red-950/50 via-slate-900 to-indigo-950/50 border-2 border-dashed border-red-500/40 rounded-xl p-4 text-center cursor-pointer hover:border-red-400 transition-all shadow-inner group"
      >
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
          <Info className="w-3.5 h-3.5" />
          <span>Sponsored Server (Fast Download Mirror)</span>
        </div>
        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors">
          🚀 Instant 1-Click Fast Cloud Mirror (No Captcha • High Speed)
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Click here to bypass wait time and unlock direct G-Drive high-speed download servers.
        </p>
        <div className="mt-2.5 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs px-4 py-1.5 rounded-lg shadow-md">
          <span>Click to Unlock High Speed Server</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    );
  }

  // 4. Sidebar 300x250
  return (
    <div
      ref={containerRef}
      id={id}
      onClick={handleBannerClick}
      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-slate-700 transition-colors group my-3"
    >
      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">
        Sponsored Server
      </div>
      <div className="h-44 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 flex flex-col items-center justify-center p-3 text-center">
        <span className="text-xs font-bold text-slate-300 group-hover:text-white">
          High-Speed VIP Cloud Mirror
        </span>
        <p className="text-[11px] text-slate-400 mt-1">
          Ultra-fast dedicated streaming & download servers without waiting.
        </p>
        <span className="mt-3 text-[11px] font-bold text-indigo-400 underline">
          Download High Speed →
        </span>
      </div>
    </div>
  );
};
