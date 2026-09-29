import React, { useState } from 'react';
import { 
  Film, 
  Search, 
  Send, 
  Shield, 
  DollarSign, 
  Menu, 
  X, 
  Star,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Movie } from '../types';

interface NavbarProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
  onOpenRequest: () => void;
  siteName: string;
  telegramLink: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  movies,
  onSelectMovie,
  onOpenAdmin,
  onOpenGuide,
  onOpenRequest,
  siteName,
  telegramLink
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = [
    { id: 'all', label: 'All Movies' },
    { id: 'bengali', label: 'Bengali' },
    { id: 'south', label: 'South Hindi Dubbed' },
    { id: 'bollywood', label: 'Bollywood' },
    { id: 'hollywood', label: 'Hollywood Dual Audio' },
    { id: 'webseries', label: 'Web Series' }
  ];

  const searchResults = searchQuery.trim()
    ? movies.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.cast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top micro bar for Telegram & Quick Actions */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-red-400 font-semibold uppercase tracking-wider text-[10px] bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
              <Sparkles className="w-3 h-3 text-red-400 animate-pulse" /> Official Hub
            </span>
            <span className="hidden sm:inline text-slate-400">
              Fast Google Drive & HubCloud Direct Links • No Broken Mirrors
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              id="topbar-telegram-btn"
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              <Send className="w-3 h-3 text-sky-400" />
              <span>Join Telegram (48k Members)</span>
            </a>
            <span className="text-slate-700">|</span>
            <button
              id="topbar-request-btn"
              onClick={onOpenRequest}
              className="hover:text-amber-400 text-slate-300 transition-colors cursor-pointer"
            >
              Movie Request
            </button>
            <span className="text-slate-700">|</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Direct G-Drive Mirrors</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => { onSelectCategory('all'); onSearchChange(''); }}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform border border-red-500/50">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-white font-['Teko'] uppercase leading-none">
                {siteName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-red-600/90 text-white px-1.5 py-0.5 rounded border border-red-400/40">
                .baby
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide leading-tight">
              300MB • 720p • 1080p • 4K
            </p>
          </div>
        </button>

        {/* Live Search Bar (Desktop & Tablet) */}
        <div className="relative flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              id="main-search-input"
              type="text"
              placeholder="Search movies, actors, Bengali, South, Bollywood..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              className="w-full bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
              <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                Search Results ({searchResults.length})
              </div>
              {searchResults.map((m) => (
                <button
                  key={m.id}
                  id={`search-item-${m.id}`}
                  onMouseDown={() => {
                    onSelectMovie(m);
                    onSearchChange('');
                  }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-10 h-14 object-cover rounded shadow border border-slate-700 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-100 truncate">{m.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {m.rating}
                      </span>
                      <span>•</span>
                      <span>{m.year}</span>
                      <span>•</span>
                      <span className="text-red-400 capitalize">{m.category}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {m.quality[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <a
            id="nav-telegram-cta"
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join Telegram</span>
          </a>

          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-nav-${cat.id}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/90 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Search & Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-4">
          <div className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search movies, actors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => { onOpenRequest(); setMobileMenuOpen(false); }}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-left text-xs font-semibold text-slate-300 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Request Movie
            </button>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-lg bg-sky-600 text-center text-xs font-semibold text-white flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Join Telegram
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
