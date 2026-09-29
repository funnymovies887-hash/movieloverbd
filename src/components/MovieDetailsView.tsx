import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Star, 
  Film, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  HardDrive, 
  Layers, 
  Share2, 
  Clock, 
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { Movie, AdSettings } from '../types';
import { AdSlot } from './AdSlot';
import { recordDirectLinkClick } from '../utils/storage';

interface MovieDetailsViewProps {
  movie: Movie;
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  allMovies: Movie[];
  adSettings: AdSettings;
  onOpenGuide: () => void;
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
  const [countdown, setCountdown] = useState<number>(adSettings.countdownSeconds || 5);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Timer countdown to maximize Adsterra / Monetag CPM impressions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCountdown(adSettings.countdownSeconds || 5);
    setIsUnlocked(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsUnlocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [movie, adSettings.countdownSeconds]);

  // Handle download link click & trigger Direct Link monetization if configured
  const handleServerClick = (serverUrl: string) => {
    // Record click for monetization stats
    recordDirectLinkClick();

    // If Direct Link (Smartlink) is enabled, pop it up in a new tab for owner's income
    if (adSettings.directLinkOnClickEnabled && adSettings.directLinkUrl) {
      window.open(adSettings.directLinkUrl, '_blank', 'noopener,noreferrer');
    }

    // Open download link or copy
    if (serverUrl.startsWith('http') || serverUrl.startsWith('magnet:')) {
      window.open(serverUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Download Link: ${serverUrl}`);
    }
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

            {movie.streamUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full max-w-[280px] mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer / Stream Preview</span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('download-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full max-w-[280px] mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform cursor-pointer"
            >
              <Download className="w-4 h-4" />
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
                  <span className="text-emerald-400 font-bold">{movie.languages.join(' • ')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Quality Available:</span>
                  <span className="text-indigo-300 font-bold">{movie.quality.join(', ')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">File Sizes:</span>
                  <span className="text-white font-semibold">
                    {movie.downloadOptions.map(o => `${o.quality} [${o.size}]`).join(' • ')}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Genres:</span>
                  <span className="text-white font-semibold">{movie.genres.join(', ')}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Subtitles:</span>
                  <span className="text-white font-semibold">English [Soft-Coded ESub]</span>
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <span className="text-slate-400 font-medium">Director:</span>
                  <span className="text-white font-semibold">{movie.director}</span>
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <span className="text-slate-400 font-medium">Star Cast:</span>
                  <span className="text-white font-semibold">{movie.cast.join(', ')}</span>
                </div>
              </div>

              {/* Storyline */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 mb-1">Storyline / Synopsis:</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>
            </div>

            {/* Safety Guarantee / Notice */}
            <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-300">
              <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="text-emerald-400">100% Virus Free & Clean Files:</strong> All prints are checked for audio sync, watermarks, and high bitrate encoding.
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Gallery Section (Essential for Moviebaaz / Vegamovies style) */}
        {movie.screenshots && movie.screenshots.length > 0 && (
          <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>Sample HD Screenshots (Quality Check)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                High Quality WEB-DL / HD-Rip Preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {movie.screenshots.map((screenUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden border border-slate-700/70 bg-slate-950 shadow group relative"
                >
                  <img
                    src={screenUrl}
                    alt={`${movie.title} screenshot ${idx + 1}`}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                    Frame #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-Between Content Sponsor Ad */}
        <div className="my-6">
          <AdSlot
            id="details-mid-ad"
            type="download-banner"
            customHtml={adSettings.downloadPageBannerHtml}
            testAdsMode={adSettings.testAdsMode}
            directLinkUrl={adSettings.directLinkUrl}
          />
        </div>

        {/* DOWNLOAD LINKS SECTION (The Core Conversion Hub) */}
        <div
          id="download-section"
          className="mt-6 bg-gradient-to-b from-[#111827] to-[#0d131f] border-2 border-red-600/50 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-red-950/30"
        >
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800/80 mb-2">
              <Sparkles className="w-3 h-3" /> Direct Cloud Mirrors
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Download {movie.title} High Speed Links
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your preferred resolution below to access Google Drive & High Speed Servers.
            </p>
          </div>

          {/* Countdown Unlock Timer (Crucial for Adsterra/Monetag CPM impression maximization) */}
          {!isUnlocked ? (
            <div className="max-w-md mx-auto my-6 p-5 bg-slate-950 border border-red-500/40 rounded-xl text-center shadow-lg">
              <Clock className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
              <h4 className="text-base font-bold text-white mt-2">
                Generating Fast Cloud Download Links...
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Please wait <span className="text-amber-400 font-extrabold text-sm">{countdown}</span> seconds to verify server availability.
              </p>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-600 h-full transition-all duration-1000"
                  style={{ width: `${(( (adSettings.countdownSeconds || 5) - countdown) / (adSettings.countdownSeconds || 5)) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
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
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {activeOption.quality} Resolution ({activeOption.size})
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Format: {activeOption.format}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-1 rounded">
                      Online & Active
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {activeOption.servers.map((server, sIdx) => (
                      <button
                        key={sIdx}
                        id={`dl-btn-${activeOption.quality}-${sIdx}`}
                        onClick={() => handleServerClick(server.url)}
                        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-red-950/70 border border-slate-700 hover:border-red-500 text-slate-100 flex items-center justify-between transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-8 h-8 rounded-lg bg-red-600/20 group-hover:bg-red-600 text-red-400 group-hover:text-white flex items-center justify-center transition-colors">
                            <HardDrive className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                              {server.name}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Instant Cloud • No Wait • Resume Supported
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover:text-white bg-red-950/80 group-hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                          <span>Download</span>
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Anti-adblock / Owner Monetization Tip */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {adSettings.antiAdblockMessage || "Please disable AdBlock if links do not open directly. Your support helps maintain high-speed servers!"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Video Trailer / Preview Modal */}
      {showVideoModal && movie.streamUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{movie.title} - Official Trailer / Preview</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={movie.streamUrl}
                title={movie.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
