import React from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedYear: string;
  onSelectYear: (year: string) => void;
  selectedQuality: string;
  onSelectQuality: (q: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  sortBy: 'latest' | 'rating' | 'views';
  onSortByChange: (sort: 'latest' | 'rating' | 'views') => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedYear,
  onSelectYear,
  selectedQuality,
  onSelectQuality,
  selectedGenre,
  onSelectGenre,
  sortBy,
  onSortByChange,
  totalResults
}) => {
  const years = ['all', '2024', '2023', '2022', '2021'];
  const qualities = ['all', '4K UHD', '1080p', '720p', '480p'];
  const genres = ['all', 'Action', 'Thriller', 'Crime', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance'];

  const hasActiveFilter = selectedCategory !== 'all' || selectedYear !== 'all' || selectedQuality !== 'all' || selectedGenre !== 'all';

  const handleResetFilters = () => {
    onSelectCategory('all');
    onSelectYear('all');
    onSelectQuality('all');
    onSelectGenre('all');
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-md mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          <span className="font-bold text-white text-sm">Filter & Browse Movies</span>
          <span className="bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full text-[11px]">
            {totalResults} Available
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              onClick={handleResetFilters}
              className="text-red-400 hover:text-red-300 underline text-xs font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="latest" className="bg-slate-900">Latest Added</option>
              <option value="rating" className="bg-slate-900">Highest IMDb Rating</option>
              <option value="views" className="bg-slate-900">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="bengali">Bengali Movies</option>
            <option value="south">South Hindi Dubbed</option>
            <option value="bollywood">Bollywood</option>
            <option value="hollywood">Hollywood Dual Audio</option>
            <option value="webseries">Web Series</option>
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Release Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Years</option>
            {years.filter(y => y !== 'all').map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Quality Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Resolution / Quality
          </label>
          <select
            value={selectedQuality}
            onChange={(e) => onSelectQuality(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Resolutions</option>
            {qualities.filter(q => q !== 'all').map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        {/* Genre Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onSelectGenre(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Genres</option>
            {genres.filter(g => g !== 'all').map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
