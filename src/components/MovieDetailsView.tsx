import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Star, 
  Film, 
  CheckCircle2, 
  ExternalLink, 
  HardDrive, 
  Share2, 
  Clock, 
  Sparkles,
  Info,
  X,
  Zap,
  Check,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Movie, AdSettings } from '../types';
import { AdSlot } from './AdSlot';
import { recordDirectLinkClick, triggerGlobalAdsterraPopunder } from '../utils/storage';

interface MovieDetailsViewProps {
  movie: Movie;
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  allMovies: Movie[];
  adSettings: AdSettings;
  onOpenGuide: () => void;
}

function formatYouTubeEmbedUrl(url: string): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  // 1. Google Drive view link -> embeddable preview
  if (trimmed.includes('drive.google.com/file/d/')) {
    const gDriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      return `https://drive.google.com/file/d/${gDriveMatch[1]}/preview`;
    }
  }

  // 2. YouTube links -> embed
  if (trimmed.includes('/embed/')) return trimmed;
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  return trimmed;
}

// Download Funnel Gateway State
interface GatewayModalData {
  server: { name: string; url: string; type?: string };
  quality: string;
  size: string;
  format: string;
  // Steps: 
  // 'timer_loading' (3s verification countdown)
  // 'revealed_btn' (Download button emerged, requires 1 ad click then advance)
  // 'generate_page' (Generate link page, requires 1 ad click then reveal final link)
  // 'final_download' (Final real file destination link)
  step: 'timer_loading' | 'revealed_btn' | 'generate_page' | 'final_download';
  timerSeconds: number;
  revealedBtnAdClicked: boolean;
  generateBtnAdClicked: boolean;
  downloadInitiated: boolean;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  movie,
  onBack,
  onSelectMovie,
  allMovies,
  adSettings,
  onOpenGuide
}) => {
  const [selectedQuality, setSelectedQuality] = useState<string>(
    movie.downloadOptions[0]?.quality || '720p'
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Watch Online Ad State
  const [watchAdClicked, setWatchAdClicked] = useState<boolean>(false);

  // Initial Server Click tracker (key = `${quality}-${serverName}`)
  const [initialServerClicks, setInitialServerClicks] = useState<Record<string, boolean>>({});

  // Active Gateway Modal
  const [gateway, setGateway] = useState<GatewayModalData | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movie]);

  // 3-second animated countdown timer for gateway
  useEffect(() => {
    if (!gateway || gateway.step !== 'timer_loading') return;

    if (gateway.timerSeconds <= 0) {
      setGateway(prev => prev ? { ...prev, step: 'revealed_btn' } : null);
      return;
    }

    const interval = setInterval(() => {
      setGateway(prev => {
        if (!prev) return null;
        if (prev.timerSeconds <= 1) {
          clearInterval(interval);
          return { ...prev, step: 'revealed_btn', timerSeconds: 0 };
        }
        return { ...prev, timerSeconds: prev.timerSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gateway?.step, gateway?.timerSeconds]);

  // Helper to reliably trigger Adsterra Popunder / Direct Smartlink
  const triggerAdsterraPopunder = () => {
    triggerGlobalAdsterraPopunder(adSettings.directLinkUrl);
  };

  // 1. Watch Online Handler
  const handleWatchOnlineClick = () => {
    if (!watchAdClicked) {
      triggerAdsterraPopunder();
      setWatchAdClicked(true);
    } else {
      setShowVideoModal(true);
      setWatchAdClicked(false);
    }
  };

  // 2. Initial Server Button Click Handler
  const handleInitialServerClick = (server: { name: string; url: string; type?: string }, opt: any) => {
    const key = `${opt.quality}-${server.name}`;
    const alreadyClickedAd = initialServerClicks[key];

    if (!alreadyClickedAd) {
      // First click: triggers popunder ad in new tab
      triggerAdsterraPopunder();
      setInitialServerClicks(prev => ({ ...prev, [key]: true }));
    } else {
      // Second click (after viewing/closing ad): opens 3-second loading gateway!
      setGateway({
        server,
        quality: opt.quality,
        size: opt.size,
        format: opt.format,
        step: 'timer_loading',
        timerSeconds: 3,
        revealedBtnAdClicked: false,
        generateBtnAdClicked: false,
        downloadInitiated: false
      });
      // Reset initial click for this button for future uses
      setInitialServerClicks(prev => ({ ...prev, [key]: false }));
    }
  };

  // 3. Step 2 Handler: Revealed Download Button Click
  const handleRevealedBtnClick = () => {
    if (!gateway) return;

    if (!gateway.revealedBtnAdClicked) {
      // Click 1: triggers popunder ad
      triggerAdsterraPopunder();
      setGateway(prev => prev ? { ...prev, revealedBtnAdClicked: true } : null);
    } else {
      // Click 2: advances to "generate download link" page
      setGateway(prev => prev ? { ...prev, step: 'generate_page' } : null);
    }
  };

  // 4. Step 3 Handler: Generate Link Button Click
  const handleGenerateLinkClick = () => {
    if (!gateway) return;

    if (!gateway.generateBtnAdClicked) {
      // Click 1: triggers popunder ad
      triggerAdsterraPopunder();
      setGateway(prev => prev ? { ...prev, generateBtnAdClicked: true } : null);
    } else {
      // Click 2: generates and reveals the final file download button
      setGateway(prev => prev ? { ...prev, step: 'final_download' } : null);
    }
  };

  // 5. Step 4 Handler: Final Real Destination File Download
  const handleFinalDownloadFile = () => {
    if (!gateway) return;

    const rawUrl = gateway.server.url?.trim() || movie.streamUrl?.trim() || '';
    if (!rawUrl) {
      alert('এই সার্ভারের লিংকটি শীঘ্রই আপডেট করা হচ্ছে। অন্য সার্ভার লিংক ট্রাই করুন বা টেলিগ্রাম চ্যানেলে যুক্ত থাকুন।');
      return;
    }

    // Trigger destination download link safely
    if (rawUrl.startsWith('http') || rawUrl.startsWith('magnet:')) {
      try {
        const a = document.createElement('a');
        a.href = rawUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        window.open(rawUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      window.location.href = rawUrl;
    }

    setGateway(prev => prev ? { ...prev, downloadInitiated: true } : null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Download ${movie.title} in 480p, 720p, 1080p from Movie Lover!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const activeOption = movie.downloadOptions.find(o => o.quality === selectedQuality) || movie.downloadOptions[0];

  const relatedMovies = allMovies
    .filter(m => m.id !== movie.id && (m.category === movie.category || m.genres.some(g => movie.genres.includes(g))))
    .slice(0, 5);

  return (
    <div className="w-full pb-16">
      {/* Breadcrumbs */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 py-2 px-4 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={onBack}
              className="hover:text-white flex items-center gap-1 text-slate-300 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </button>
            <span>/</span>
            <span className="capitalize text-slate-300">{movie.category}</span>
            <span>/</span>
            <span className="text-red-400 font-semibold truncate">{movie.title}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded cursor-pointer transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner Ad */}
      <div className="max-w-6xl mx-auto px-4 mt-2">
        <AdSlot
          id="details-top-ad"
          type="header-728x90"
          customHtml={adSettings.headerBannerHtml}
          testAdsMode={adSettings.testAdsMode}
          directLinkUrl={adSettings.directLinkUrl}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        {/* Main Title Heading (Moviebaaz style) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
            Download {movie.title} ({movie.languages.join(', ')}) Full Movie 480p [{movie.downloadOptions[0]?.size || '400MB'}] | 720p [{movie.downloadOptions[1]?.size || '1.2GB'}] | 1080p [{movie.downloadOptions[2]?.size || '2.6GB'}] WEB-DL
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-2.5">
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase">
              {movie.category}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {movie.rating} / 10 (IMDb)
            </span>
            <span>•</span>
            <span>{movie.duration}</span>
            <span>•</span>
            <span>{movie.releaseDate}</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Speed G-Drive Verified
            </span>
          </div>
        </div>

        {/* Movie Info & Poster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          {/* Left: Poster & Trailer Button */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[280px] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/80 group relative">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-amber-300">
                {movie.quality.join(' | ')}
              </div>
            </div>

            {/* Watch Online Button with Popunder integration */}
            {movie.streamUrl && (
              <button
                onClick={handleWatchOnlineClick}
                className={`w-full max-w-[280px] mt-3 py-3 px-4 rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ring-2 ${
                  watchAdClicked
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 ring-emerald-400 animate-pulse'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/40 ring-red-500/50'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {watchAdClicked
                    ? '▶ প্লে করতে আবার চাপ দিন (Click to Play)'
                    : 'Watch Online (ফুল মুভি দেখুন)'}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('download-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full max-w-[280px] mt-2.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Go to Download Links ↓</span>
            </button>
          </div>

          {/* Right: Technical Specs Table */}
          <div className="md:col-span-8 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  <span>Movie Information & Technical Details</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Full Title:</span>
                  <span className="text-white font-semibold">{movie.title}</span>
                </div>

                {movie.originalTitle && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-medium">Original Title:</span>
                    <span className="text-amber-300 font-semibold">{movie.originalTitle}</span>
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Release Year & Date:</span>
                  <span className="text-white font-semibold">{movie.releaseDate}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Audio Languages:</span>
                  <span className="text-emerald-400 font-semibold">{movie.languages.join(' • ')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Movie Category:</span>
                  <span className="text-white font-semibold capitalize">{movie.category}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Genres:</span>
                  <span className="text-slate-200 font-semibold">{movie.genres.join(', ')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Director:</span>
                  <span className="text-slate-200">{movie.director}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Star Cast:</span>
                  <span className="text-slate-200">{movie.cast.join(', ')}</span>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Synopsis / Storyline:
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {movie.synopsis}
                </p>
              </div>
            </div>

            {/* Screenshots Preview */}
            {movie.screenshots && movie.screenshots.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Screenshots & Quality Preview</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {movie.screenshots.slice(0, 3).map((shot, sIdx) => (
                    <div key={sIdx} className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black">
                      <img
                        src={shot}
                        alt={`Screenshot ${sIdx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Section (ID Anchor) */}
        <div id="download-section" className="mt-10 scroll-mt-20">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1 text-red-400 bg-red-950/80 border border-red-800/80 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-red-400" /> High-Speed Cloud Servers
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Download {movie.title} Movie
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
              যেকোনো রেজোলিউশন সিলেক্ট করে ডাউনলোড বাটনে চাপ দিন। আপনার ফাইলটি গুগল ড্রাইভ ও হাই-স্পিড ক্লাউড সার্ভার থেকে সরাসরি ডাউনলোড হবে।
            </p>
          </div>

          <div className="space-y-6">
            {/* Quality Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {movie.downloadOptions.map((opt) => (
                <button
                  key={opt.quality}
                  onClick={() => setSelectedQuality(opt.quality)}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    selectedQuality === opt.quality
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 scale-105'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>{opt.quality}</span>
                  <span className="text-[11px] font-medium bg-black/40 px-1.5 py-0.5 rounded">
                    {opt.size}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Quality Server Links */}
            {activeOption && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span>{activeOption.quality} Resolution ({activeOption.size})</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Format: {activeOption.format}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">
                    Online & Active
                  </span>
                </div>

                <div className="space-y-3">
                  {activeOption.servers.map((server, sIdx) => {
                    const key = `${activeOption.quality}-${server.name}`;
                    const isAdClicked = initialServerClicks[key];

                    return (
                      <div key={sIdx} className="space-y-1">
                        <button
                          id={`dl-btn-${activeOption.quality}-${sIdx}`}
                          onClick={() => handleInitialServerClick(server, activeOption)}
                          className={`w-full py-3.5 px-4 rounded-xl border text-slate-100 flex items-center justify-between transition-all group cursor-pointer ${
                            isAdClicked
                              ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20'
                              : 'bg-slate-900 hover:bg-red-950/70 border-slate-700 hover:border-red-500'
                          }`}
                        >
                          <div className="flex items-center gap-3 text-left">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                              isAdClicked 
                                ? 'bg-amber-500 text-black font-black animate-pulse'
                                : 'bg-red-600/20 group-hover:bg-red-600 text-red-400 group-hover:text-white'
                            }`}>
                              <HardDrive className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-red-300 transition-colors">
                                {server.name}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {isAdClicked
                                  ? '⚡ বিজ্ঞাপন কেটে আবার ক্লিক করুন (Click again to start 3s loading)'
                                  : 'Instant Cloud • Resume Supported • Direct Link'}
                              </span>
                            </div>
                          </div>

                          <div className={`flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition-all ${
                            isAdClicked
                              ? 'bg-amber-500 text-slate-950 animate-bounce'
                              : 'bg-red-950/80 group-hover:bg-red-600 text-red-400 group-hover:text-white'
                          }`}>
                            <span>{isAdClicked ? 'Start Loading ↓' : 'Download'}</span>
                            <Download className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Anti-adblock / Monetization Notice */}
                <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {adSettings.antiAdblockMessage || "ডাউনলোড বাটনে ক্লিক করার পর বিজ্ঞাপন আসলে তা কেটে পুনরায় বাটনে ক্লিক করুন। বিজ্ঞাপন আমাদের হাই-স্পিড গুগল ড্রাইভ সার্ভার সচল রাখতে সাহায্য করে।"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Banner Ad Slot */}
        <div className="mt-8">
          <AdSlot
            id="details-download-ad"
            type="download-banner"
            customHtml={adSettings.downloadPageBannerHtml}
            testAdsMode={adSettings.testAdsMode}
            directLinkUrl={adSettings.directLinkUrl}
          />
        </div>

        {/* Related Movies Row */}
        {relatedMovies.length > 0 && (
          <div className="mt-12">
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">
                You May Also Like ({movie.category.toUpperCase()})
              </h3>
              <span className="text-xs text-slate-400">Recommended for you</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {relatedMovies.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectMovie(rel)}
                  className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-500/50 cursor-pointer group transition-all"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={rel.posterUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-amber-300 font-bold">
                      ★ {rel.rating}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400">
                      {rel.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{rel.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 🚀 MULTI-STAGE DOWNLOAD GATEWAY MODAL (USER SPECIFIED)    */}
      {/* ========================================================= */}
      {gateway && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-sm">
                    {movie.title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {gateway.quality} • {gateway.size} • {gateway.server.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setGateway(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
              <div className={`flex items-center gap-1.5 ${gateway.step === 'timer_loading' || gateway.step === 'revealed_btn' ? 'text-amber-400' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
                <span>সার্ভার চেক</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <div className={`flex items-center gap-1.5 ${gateway.step === 'generate_page' ? 'text-amber-400' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                <span>লিংক জেনারেট</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <div className={`flex items-center gap-1.5 ${gateway.step === 'final_download' ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
                <span>ফাইল ডাউনলোড</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* STAGE 1: 3-Second Loading Timer */}
              {gateway.step === 'timer_loading' && (
                <div className="text-center py-6 space-y-4">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {gateway.timerSeconds}s
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white">
                      সার্ভার স্লট ভেরিফাই করা হচ্ছে...
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      দয়া করে ৩ সেকেন্ড অপেক্ষা করুন। আপনার জন্য হাই-স্পিড ডাউনলোড লিংক প্রস্তুত করা হচ্ছে।
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 2: 3-Second Finished -> Download Button Emerged */}
              {gateway.step === 'revealed_btn' && (
                <div className="text-center py-4 space-y-5 animate-fadeIn">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                    <CheckCircle2 className="w-7 h-7 text-amber-400" />
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      সার্ভার ভেরিফিকেশন সম্পন্ন!
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {gateway.revealedBtnAdClicked
                        ? '✅ বিজ্ঞাপন দেখা হয়েছে। এবার পরবর্তী পেজে যেতে আবার বাটনে চাপ দিন।'
                        : 'নিচের বাটনে ক্লিক করে পরবর্তী ধাপে এগিয়ে যান।'}
                    </p>
                  </div>

                  <button
                    onClick={handleRevealedBtnClick}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer ring-2 ${
                      gateway.revealedBtnAdClicked
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white ring-emerald-400 animate-pulse'
                        : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white ring-red-500/50 shadow-red-600/30'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    <span>
                      {gateway.revealedBtnAdClicked
                        ? 'এগিয়ে যান (Click to Continue) →'
                        : 'Download Links Ready - Continue (ডাউনলোড বাটনে ক্লিক করুন)'}
                    </span>
                  </button>

                  {!gateway.revealedBtnAdClicked && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      (প্রথম ক্লিকে বিজ্ঞাপন আসলে তা কেটে পুনরায় চাপ দিন)
                    </p>
                  )}
                </div>
              )}

              {/* STAGE 3: Next Page -> Generate Download Link */}
              {gateway.step === 'generate_page' && (
                <div className="text-center py-4 space-y-5 animate-fadeIn">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                    <Zap className="w-7 h-7 text-indigo-400" />
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      ধাপ ২: ডাউনলোড লিংক জেনারেট
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {gateway.generateBtnAdClicked
                        ? '✅ লিংক জেনারেট সম্পন্ন! ফাইনাল ফাইল পেতে আবার বাটনে চাপ দিন।'
                        : 'নিচের জেনারেট বাটনে ক্লিক করে ফাইল ডাউনলোড লিংক তৈরি করুন।'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Movie File:</span>
                      <span className="text-white font-bold truncate max-w-[200px]">{movie.title}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Quality & Size:</span>
                      <span className="text-emerald-400 font-bold">{gateway.quality} ({gateway.size})</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Server Gateway:</span>
                      <span className="text-amber-400 font-bold">{gateway.server.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateLinkClick}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer ring-2 ${
                      gateway.generateBtnAdClicked
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white ring-emerald-400 animate-pulse'
                        : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white ring-purple-500/50 shadow-purple-600/30'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span>
                      {gateway.generateBtnAdClicked
                        ? 'ফাইনাল ডাউনলোড আনলক করুন (Click to Unlock) →'
                        : 'Generate Download Link (লিংক তৈরি করুন)'}
                    </span>
                  </button>

                  {!gateway.generateBtnAdClicked && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      (প্রথম ক্লিকে বিজ্ঞাপন আসলে তা কেটে পুনরায় চাপ দিন)
                    </p>
                  )}
                </div>
              )}

              {/* STAGE 4: Final Real Download File Destination */}
              {gateway.step === 'final_download' && (
                <div className="text-center py-4 space-y-5 animate-fadeIn">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      🎉 আপনার ফাইল ডাউনলোড প্রস্তুত!
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      নিচের বাটনে ক্লিক করলেই আপনার কাঙ্ক্ষিত ক্লাউড ফাইলটি সরাসরি ডাউনলোড শুরু হবে।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-left text-xs space-y-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">File Server:</span>
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {gateway.server.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Resolution:</span>
                      <span className="text-white font-bold">{gateway.quality} • {gateway.format}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">File Size:</span>
                      <span className="text-amber-400 font-mono font-bold">{gateway.size}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFinalDownloadFile}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-400"
                  >
                    <Download className="w-6 h-6 animate-bounce" />
                    <span>📥 Download File Now ({gateway.server.name})</span>
                  </button>

                  {(gateway.server.url?.trim() || movie.streamUrl?.trim()) && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <a
                        href={gateway.server.url?.trim() || movie.streamUrl?.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer hover:scale-105 transition-transform"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>সরাসরি লিঙ্ক ওপেন করুন (Direct Link if download did not start)</span>
                      </a>
                    </div>
                  )}

                  {gateway.downloadInitiated && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                      ✅ ডাউনলোড লিংক সম্পন্ন হয়েছে! নতুন উইন্ডোতে ফাইল ডাউনলোড বা স্ট্রিম শুরু হয়েছে।
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>১০০% ভাইরাস ও ম্যালওয়্যার মুক্ত ক্লাউড লিংক</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Video Stream / Watch Online Modal */}
      {showVideoModal && movie.streamUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {movie.title} - Watch Online (অনলাইনে দেখুন)
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black relative flex items-center justify-center">
              {movie.streamUrl.match(/\.(mp4|webm|ogg|m4v)(\?.*)?$/i) ? (
                <video
                  src={movie.streamUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video player.
                </video>
              ) : (
                <iframe
                  src={formatYouTubeEmbedUrl(movie.streamUrl)}
                  title={movie.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
            <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>HD Video Player • High Speed Streaming</span>
              <a
                href={movie.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
