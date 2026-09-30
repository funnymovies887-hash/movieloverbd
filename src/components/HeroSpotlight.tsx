import React, { useState, useEffect } from 'react';
import { Download, Play, Star, Sparkles, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Movie } from '../types';

interface HeroSpotlightProps {
  featuredMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ featuredMovies, onSelectMovie }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies.length) return null;

  const current = featuredMovies[currentIndex] || featuredMovies[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-950 mb-6 group">
      {/* Background Backdrop with Gradient Overlays */}
      <div className="relative h-[320px] sm:h-[400px] lg:h-[440px] w-full overflow-hidden bg-slate-900">
        <img
          src={current.backdropUrl || current.posterUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.45] transition-all duration-700 group-hover:scale-105"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/40 to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-5 sm:px-8 flex items-end pb-8 sm:pb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 max-w-3xl">
            {/* Small Floating Poster */}
            <div className="hidden sm:block w-28 lg:w-36 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/80 flex-shrink-0 group-hover:border-red-500 transition-colors">
              <img
                src={current.posterUrl}
                alt={current.title}
                className="w-full aspect-[2/3] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info and Actions */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow-md shadow-red-600/40">
                  <Sparkles className="w-3 h-3" /> Featured Premiere
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/90 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  {current.quality.slice(0, 2).join(' | ')}
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {current.rating} (IMDb)
                </span>
                <span className="text-xs text-slate-400">• {current.year}</span>
                <span className="text-xs text-emerald-400 font-medium hidden sm:inline flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> G-Drive Ready
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {current.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                {current.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-download-btn"
                  onClick={() => onSelectMovie(current)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-red-600/40 transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Movie</span>
                </button>

                {current.streamUrl && (
                  <button
                    onClick={() => onSelectMovie(current)}
                    className="py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>Watch Preview</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
          title="Previous Featured Movie"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
          title="Next Featured Movie"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'bg-red-500 w-6' : 'bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
