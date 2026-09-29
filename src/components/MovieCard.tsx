import React, { useState } from 'react';
import { Download, Play, Star, Eye, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  // Reliable fallback poster if external link fails
  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';

  const categoryLabels: Record<string, { label: string; color: string }> = {
    bengali: { label: 'Bengali', color: 'bg-emerald-600 text-white' },
    south: { label: 'South Hindi', color: 'bg-amber-600 text-white' },
    bollywood: { label: 'Bollywood', color: 'bg-indigo-600 text-white' },
    hollywood: { label: 'Dual Audio', color: 'bg-blue-600 text-white' },
    webseries: { label: 'Series', color: 'bg-rose-600 text-white' },
    anime: { label: 'Anime', color: 'bg-purple-600 text-white' }
  };

  const badgeInfo = categoryLabels[movie.category] || { label: movie.category, color: 'bg-slate-700 text-white' };

  return (
    <div
      id={`movie-card-${movie.id}`}
      onClick={() => onSelect(movie)}
      className="group relative bg-[#111827] rounded-xl overflow-hidden border border-slate-800/80 hover:border-red-500/60 shadow-md hover:shadow-2xl hover:shadow-red-950/40 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={imageError ? fallbackPoster : movie.posterUrl}
          alt={movie.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Dark Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/60 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
          {/* Quality Badge */}
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 shadow">
            {movie.quality.slice(0, 2).join(' | ')}
          </span>

          {/* Category / Language Badge */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${badgeInfo.color}`}>
            {badgeInfo.label}
          </span>
        </div>

        {/* Featured Tag */}
        {movie.isFeatured && (
          <div className="absolute top-9 left-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest bg-red-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" /> Hot
            </span>
          </div>
        )}

        {/* Bottom Poster Overlay with Rating & Year */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/30 text-amber-300 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700">
            <span>{movie.year}</span>
          </div>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 gap-2 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(movie);
            }}
            className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/40 transition-transform transform active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Links</span>
          </button>

          {movie.streamUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(movie);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-600 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Watch Trailer</span>
            </button>
          )}

          <p className="text-[10px] text-slate-300 line-clamp-3 text-center mt-1 px-1">
            {movie.synopsis}
          </p>
        </div>
      </div>

      {/* Movie Details Info Bar */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
            {movie.title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            {movie.languages.join(', ')}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[130px]">{movie.genres.slice(0, 2).join(' • ')}</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Eye className="w-3 h-3 text-slate-400" />
            <span>{(movie.views / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>
    </div>
  );
};
