import React, { useState, useEffect } from 'react';
import { 
  getStoredMovies, 
  getStoredAdSettings, 
  getStoredSiteConfig, 
  getStoredRequests, 
  getStoredAdStats,
  fetchServerDatabase,
  triggerGlobalAdsterraPopunder
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
import { Film, DollarSign, Sparkles, Send, Flame, HelpCircle, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

// Helper to parse URL into application route state
function parseCurrentUrl(allMovies: Movie[]) {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;

  // 1. Admin route
  const lowerPath = path.toLowerCase();
  const lowerHash = hash.toLowerCase();
  const lowerSearch = search.toLowerCase();
  const isAdmin = (
    lowerPath === '/admin' ||
    lowerPath === '/admin/' ||
    lowerPath.startsWith('/admin') ||
    lowerHash === '#admin' ||
    lowerHash === '#/admin' ||
    lowerHash.includes('admin') ||
    lowerSearch.includes('admin=true') ||
    lowerSearch.includes('page=admin')
  );

  // 2. Movie route (/movie/:slug, #/movie/:slug, ?movie=:slug)
  let movieSlug: string | null = null;
  const pathMatch = path.match(/^\/movie\/([^\/\?#]+)/i);
  const hashMatch = hash.match(/^#\/?movie\/([^\/\?#]+)/i);
  const searchParams = new URLSearchParams(search);
  const queryMovie = searchParams.get('movie');

  if (pathMatch) {
    movieSlug = decodeURIComponent(pathMatch[1]);
  } else if (hashMatch) {
    movieSlug = decodeURIComponent(hashMatch[1]);
  } else if (queryMovie) {
    movieSlug = decodeURIComponent(queryMovie);
  }

  // 3. Category route (/category/:category, #/category/:category, ?category=:category)
  let category: string = 'all';
  const pathCatMatch = path.match(/^\/category\/([^\/\?#]+)/i);
  const hashCatMatch = hash.match(/^#\/?category\/([^\/\?#]+)/i);
  const queryCat = searchParams.get('category');

  if (pathCatMatch) {
    category = decodeURIComponent(pathCatMatch[1]);
  } else if (hashCatMatch) {
    category = decodeURIComponent(hashCatMatch[1]);
  } else if (queryCat) {
    category = decodeURIComponent(queryCat);
  }

  // 4. Page number (?page=2, ?p=2)
  const queryPage = searchParams.get('page') || searchParams.get('p');
  const page = queryPage ? Math.max(1, parseInt(queryPage, 10) || 1) : 1;

  let matchedMovie: Movie | null = null;
  if (movieSlug && Array.isArray(allMovies)) {
    matchedMovie = allMovies.find(m => m.slug === movieSlug || m.id === movieSlug) || null;
  }

  return {
    isAdmin,
    movieSlug,
    matchedMovie,
    category,
    page
  };
}

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(() => getStoredMovies());
  const [adSettings, setAdSettings] = useState<AdSettings>(() => getStoredAdSettings());
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => getStoredSiteConfig());
  const [requests, setRequests] = useState<MovieRequest[]>(() => getStoredRequests());

  // Parse initial route from URL synchronously on first render so refresh never loses position
  const initialRoute = React.useMemo(() => parseCurrentUrl(getStoredMovies()), []);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(() => initialRoute.matchedMovie);
  const [pendingMovieSlug, setPendingMovieSlug] = useState<string | null>(() => 
    !initialRoute.matchedMovie && initialRoute.movieSlug ? initialRoute.movieSlug : null
  );
  const [currentCategory, setCurrentCategory] = useState<string>(() => initialRoute.category);
  const [currentPage, setCurrentPage] = useState<number>(() => initialRoute.page || 1);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => initialRoute.isAdmin);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filters & Sorting
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'views'>('latest');

  // Modals
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
        // If current URL contains a movie slug, sync state with the latest movie record
        const route = parseCurrentUrl(serverData.movies);
        if (route.matchedMovie) {
          setSelectedMovie(route.matchedMovie);
          setPendingMovieSlug(null);
        } else if (pendingMovieSlug) {
          const match = serverData.movies.find(m => m.slug === pendingMovieSlug || m.id === pendingMovieSlug);
          if (match) {
            setSelectedMovie(match);
            setPendingMovieSlug(null);
          }
        }
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
  }, [pendingMovieSlug]);

  // Live auto-synchronization: ensures any update made on admin phone appears on all visitor devices automatically
  useEffect(() => {
    const doSync = () => {
      fetchServerDatabase().then((serverData) => {
        if (!serverData) return;
        if (Array.isArray(serverData.movies) && serverData.movies.length > 0) {
          setMovies(serverData.movies);
        }
        if (serverData.adSettings) setAdSettings(serverData.adSettings);
        if (serverData.siteConfig) setSiteConfig(serverData.siteConfig);
        if (Array.isArray(serverData.requests)) setRequests(serverData.requests);
      });
    };

    // Poll every 15 seconds
    const interval = setInterval(doSync, 15000);

    // Also sync immediately whenever user switches to tab / window focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        doSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', doSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', doSync);
    };
  }, []);

  // Reset pagination to page 1 whenever search, category, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, searchQuery, selectedYear, selectedQuality, selectedGenre, sortBy]);

  // Listen to browser Back/Forward navigation & URL changes
  useEffect(() => {
    const handleUrlRouting = () => {
      const route = parseCurrentUrl(movies.length ? movies : getStoredMovies());
      setIsAdminOpen(route.isAdmin);
      if (route.matchedMovie) {
        setSelectedMovie(route.matchedMovie);
        setPendingMovieSlug(null);
        document.title = `${route.matchedMovie.title} - ${siteConfig.siteName}`;
      } else if (!route.movieSlug) {
        setSelectedMovie(null);
        setPendingMovieSlug(null);
        document.title = `${siteConfig.siteName} - ${siteConfig.tagline}`;
      } else {
        setPendingMovieSlug(route.movieSlug);
      }
      if (route.category) {
        setCurrentCategory(route.category);
      }
      if (route.page) {
        setCurrentPage(route.page);
      }
    };

    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);

    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, [movies, siteConfig.siteName, siteConfig.tagline]);

  const handleOpenAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({ type: 'admin' }, '', '/admin');
    }
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    setIsAdminOpen(false);
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

  // 20 Movies Per Page Pagination
  const MOVIES_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(sortedMovies.length / MOVIES_PER_PAGE));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedMovies = sortedMovies.slice((activePage - 1) * MOVIES_PER_PAGE, activePage * MOVIES_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === activePage) return;

    // Trigger popunder ad on pagination click as requested
    triggerGlobalAdsterraPopunder(adSettings.directLinkUrl);

    setCurrentPage(newPage);

    // Update URL query parameter ?page=
    const params = new URLSearchParams(window.location.search);
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    const queryPart = params.toString() ? `?${params.toString()}` : '';
    const newUrl = `${window.location.pathname}${queryPart}${window.location.hash}`;
    window.history.pushState({ page: newPage }, '', newUrl);

    // Smooth scroll to top of movie grid
    const el = document.getElementById('movie-list-heading');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const featuredMovies = movies.filter((m) => m.isFeatured || m.isTrending).slice(0, 5);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setPendingMovieSlug(null);
    const targetPath = `/movie/${movie.slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ type: 'movie', slug: movie.slug }, '', targetPath);
    }
    document.title = `${movie.title} - ${siteConfig.siteName}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedMovie(null);
    setPendingMovieSlug(null);
    const targetPath = currentCategory && currentCategory !== 'all' ? `/category/${currentCategory}` : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    document.title = `${siteConfig.siteName} - ${siteConfig.tagline}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setCurrentCategory(cat);
    setSelectedMovie(null);
    setPendingMovieSlug(null);
    setCurrentPage(1);
    const targetPath = cat !== 'all' ? `/category/${cat}` : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ type: 'category', category: cat }, '', targetPath);
    }
    document.title = cat !== 'all'
      ? `${cat.toUpperCase()} Movies - ${siteConfig.siteName}`
      : `${siteConfig.siteName} - ${siteConfig.tagline}`;
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
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        movies={movies}
        onSelectMovie={handleSelectMovie}
        onOpenAdmin={handleOpenAdmin}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenRequest={() => setIsRequestOpen(true)}
        siteName={siteConfig.siteName}
        telegramLink={siteConfig.telegramLink}
      />

      {/* Notice Marquee Ticker */}
      <NoticeMarquee announcement={siteConfig.marqueeAnnouncement} />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {pendingMovieSlug && !selectedMovie ? (
          /* Movie Loading Skeleton on refresh / direct deep-link */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 animate-fadeIn shadow-2xl">
            <div className="w-14 h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-white">মুভির তথ্য লোড হচ্ছে...</h3>
            <p className="text-xs text-slate-400 mt-1">দয়া করে এক মুহূর্ত অপেক্ষা করুন, সার্ভার ডাটাবেজ থেকে মুভি লোড হচ্ছে।</p>
          </div>
        ) : selectedMovie ? (
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
              onSelectCategory={handleSelectCategory}
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
            <div id="movie-list-heading" className="flex items-center justify-between border-b border-slate-800 pb-3 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h1 className="text-lg sm:text-xl font-black text-white capitalize">
                  {currentCategory === 'all' 
                    ? 'Latest Uploads & Trending Releases' 
                    : `${currentCategory} Movies & Web Series`}
                </h1>
              </div>

              <div className="text-xs text-slate-400">
                Showing <strong className="text-white">{sortedMovies.length === 0 ? 0 : `${(activePage - 1) * MOVIES_PER_PAGE + 1}-${Math.min(activePage * MOVIES_PER_PAGE, sortedMovies.length)}`}</strong> of <strong className="text-white">{sortedMovies.length}</strong> titles
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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {paginatedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={handleSelectMovie}
                    />
                  ))}
                </div>

                {/* 20 Movies Sequential Pagination Bar */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Page info badge */}
                    <div className="text-xs text-slate-400 font-medium order-2 sm:order-1 text-center sm:text-left">
                      পেজ <strong className="text-white font-bold">{activePage}</strong> এর <strong className="text-white font-bold">{totalPages}</strong> (মোট <span className="text-red-400 font-bold">{sortedMovies.length}</span> টি মুভি • প্রতি পেজে ২০ টি)
                    </div>

                    {/* Pagination Button Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
                      {/* Previous Page Button */}
                      <button
                        onClick={() => handlePageChange(activePage - 1)}
                        disabled={activePage <= 1}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activePage <= 1
                            ? 'bg-slate-900 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-50'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-red-500 shadow-md active:scale-95'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>পূর্ববর্তী পেজ (Prev)</span>
                      </button>

                      {/* Numbered Pills */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => {
                          if (totalPages <= 7) return true;
                          return p === 1 || p === totalPages || Math.abs(p - activePage) <= 1;
                        })
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const hasGap = prev && p - prev > 1;

                          return (
                            <React.Fragment key={p}>
                              {hasGap && <span className="px-1 text-slate-600 font-bold text-xs">...</span>}
                              <button
                                onClick={() => handlePageChange(p)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                  p === activePage
                                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold shadow-lg shadow-red-600/30 scale-105 ring-2 ring-red-400'
                                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      {/* Next Page Button */}
                      <button
                        onClick={() => handlePageChange(activePage + 1)}
                        disabled={activePage >= totalPages}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activePage >= totalPages
                            ? 'bg-slate-900 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-500/50 shadow-md shadow-red-600/20 active:scale-95'
                        }`}
                      >
                        <span>পরবর্তী পেজ (Next)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
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
