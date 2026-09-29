import React, { useState, useEffect } from 'react';
import { 
  getStoredMovies, 
  getStoredAdSettings, 
  getStoredSiteConfig, 
  getStoredRequests, 
  getStoredAdStats,
  fetchServerDatabase
} from './utils/storage';
import { Movie, AdSettings, SiteConfig, MovieRequest } from './types';
import { Navbar } from './components/Navbar';
import { NoticeMarquee } from './components/NoticeMarquee';
import { HeroSpotlight } from './components/HeroSpotlight';
import { FilterBar } from './components/FilterBar';
import { MovieCard } from './components/MovieCard';
import { MovieDetailsView } from './components/MovieDetailsView';
import { AdSlot } from './components/AdSlot';
import { AdminPanel } from './components/AdminPanel';
import { MonetizationGuideModal } from './components/MonetizationGuideModal';
import { RequestMovieModal } from './components/RequestMovieModal';
import { Footer } from './components/Footer';
import { Film, DollarSign, Sparkles, Send, Flame, HelpCircle } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(() => getStoredMovies());
  const [adSettings, setAdSettings] = useState<AdSettings>(() => getStoredAdSettings());
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getStoredSiteConfig());
  const [requests, setRequests] = useState<MovieRequest[]>(() => getStoredRequests());

  // Navigation State
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filters & Sorting
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'views'>('latest');

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isRequestOpen, setIsRequestOpen] = useState<boolean>(false);

  // Sync state if storage changes in another tab or window
  useEffect(() => {
    const handleStorageChange = () => {
      setMovies(getStoredMovies());
      setAdSettings(getStoredAdSettings());
      setSiteConfig(getStoredSiteConfig());
      setRequests(getStoredRequests());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch & sync live database from permanent server disk storage (/data/db.json)
  useEffect(() => {
    let isMounted = true;
    fetchServerDatabase().then((serverData) => {
      if (!isMounted || !serverData) return;
      if (Array.isArray(serverData.movies) && serverData.movies.length > 0) {
        setMovies(serverData.movies);
      }
      if (serverData.adSettings) {
        setAdSettings(serverData.adSettings);
      }
      if (serverData.siteConfig) {
        setSiteConfig(serverData.siteConfig);
      }
      if (Array.isArray(serverData.requests)) {
        setRequests(serverData.requests);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Dedicated Separate Admin Panel URL Routing (/admin, #admin, ?admin=true)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/admin' ||
        path === '/admin/' ||
        path.startsWith('/admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.includes('admin') ||
        search.includes('admin=true') ||
        search.includes('page=admin')
      ) {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);

    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  const handleOpenAdmin = () => {
    // Navigate cleanly so any ad scripts and click listeners are completely removed
    window.location.href = '/admin';
  };

  const handleCloseAdmin = () => {
    window.location.href = '/';
  };

  // If in Admin Mode, render the dedicated separate Admin Dashboard Page!
  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <AdminPanel
          isOpen={true}
          onClose={handleCloseAdmin}
          movies={movies}
          onMoviesUpdated={setMovies}
          adSettings={adSettings}
          onAdSettingsUpdated={setAdSettings}
          siteConfig={siteConfig}
          onSiteConfigUpdated={setSiteConfig}
          requests={requests}
          onRequestsUpdated={setRequests}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
        <MonetizationGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onOpenAdmin={() => setIsGuideOpen(false)}
        />
      </div>
    );
  }

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    // 1. Category Filter
    if (currentCategory !== 'all' && movie.category !== currentCategory) {
      return false;
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchNative = movie.originalTitle && movie.originalTitle.toLowerCase().includes(q);
      const matchCast = movie.cast.some((c) => c.toLowerCase().includes(q));
      const matchGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
      if (!matchTitle && !matchNative && !matchCast && !matchGenre) {
        return false;
      }
    }

    // 3. Year Filter
    if (selectedYear !== 'all' && movie.year.toString() !== selectedYear) {
      return false;
    }

    // 4. Quality Filter
    if (selectedQuality !== 'all' && !movie.quality.includes(selectedQuality)) {
      return false;
    }

    // 5. Genre Filter
    if (selectedGenre !== 'all' && !movie.genres.includes(selectedGenre)) {
      return false;
    }

    return true;
  });

  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'views') return b.views - a.views;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const featuredMovies = movies.filter((m) => m.isFeatured || m.isTrending).slice(0, 5);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedMovie(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Popunder script injection if configured by owner in Admin */}
      {adSettings.popunderScript && (
        <div dangerouslySetInnerHTML={{ __html: adSettings.popunderScript }} />
      )}

      {/* Main Navbar */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedMovie(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        movies={movies}
        onSelectMovie={handleSelectMovie}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenRequest={() => setIsRequestOpen(true)}
        siteName={siteConfig.siteName}
        telegramLink={siteConfig.telegramLink}
      />

      {/* Notice Marquee Ticker */}
      <NoticeMarquee announcement={siteConfig.marqueeAnnouncement} />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {selectedMovie ? (
          /* Movie Details & Download Links View */
          <MovieDetailsView
            movie={selectedMovie}
            onBack={handleBackToHome}
            onSelectMovie={handleSelectMovie}
            allMovies={movies}
            adSettings={adSettings}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        ) : (
          /* Homepage / Category Grid View */
          <div className="space-y-6">
            
            {/* Top Leaderboard Ad (Adsterra / Monetag CPM) */}
            <AdSlot
              id="home-top-ad"
              type="header-728x90"
              customHtml={adSettings.headerBannerHtml}
              testAdsMode={adSettings.testAdsMode}
              directLinkUrl={adSettings.directLinkUrl}
            />

            {/* Featured Premiere Carousel (only on Homepage when not searching) */}
            {currentCategory === 'all' && !searchQuery && featuredMovies.length > 0 && (
              <HeroSpotlight
                featuredMovies={featuredMovies}
                onSelectMovie={handleSelectMovie}
              />
            )}

            {/* Filter & Sorting Bar */}
            <FilterBar
              selectedCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              selectedQuality={selectedQuality}
              onSelectQuality={setSelectedQuality}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              totalResults={sortedMovies.length}
            />

            {/* Category Title Section */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h1 className="text-lg sm:text-xl font-black text-white capitalize">
                  {currentCategory === 'all' 
                    ? 'Latest Uploads & Trending Releases' 
                    : `${currentCategory} Movies & Web Series`}
                </h1>
              </div>

              <div className="text-xs text-slate-400">
                Showing <strong className="text-white">{sortedMovies.length}</strong> titles
              </div>
            </div>

            {/* Movies Grid */}
            {sortedMovies.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Movies Found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  We couldn't find any movie matching your search or filters. You can request it!
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      setCurrentCategory('all');
                      setSearchQuery('');
                      setSelectedYear('all');
                      setSelectedQuality('all');
                      setSelectedGenre('all');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsRequestOpen(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Request this Movie
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {sortedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={handleSelectMovie}
                  />
                ))}
              </div>
            )}

            {/* Bottom In-Feed Sponsor Ad */}
            <div className="pt-6">
              <AdSlot
                id="home-feed-ad"
                type="header-728x90"
                customHtml={adSettings.headerBannerHtml}
                testAdsMode={adSettings.testAdsMode}
                directLinkUrl={adSettings.directLinkUrl}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Sticky Footer Ad (Earns continuous CPM even if user does not click!) */}
      {adSettings.enabled && (
        <AdSlot
          id="global-sticky-footer-ad"
          type="footer-sticky"
          customHtml={adSettings.footerStickyBannerHtml}
          testAdsMode={adSettings.testAdsMode}
          directLinkUrl={adSettings.directLinkUrl}
        />
      )}

      {/* Floating Telegram Launcher */}
      <div className="fixed bottom-14 right-4 z-40 flex flex-col items-end gap-2.5">
        <a
          href={siteConfig.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-lg shadow-sky-950/60 border border-sky-400/40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telegram (48k)</span>
        </a>
      </div>

      {/* User Movie Request Modal */}
      <RequestMovieModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onRequestSubmitted={setRequests}
      />

      {/* Footer */}
      <Footer
        siteName={siteConfig.siteName}
        telegramLink={siteConfig.telegramLink}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedMovie(null);
        }}
        onOpenAdmin={handleOpenAdmin}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenRequest={() => setIsRequestOpen(true)}
      />
    </div>
  );
}
