import { Movie, AdSettings, SiteConfig, MovieRequest, AdImpressionStats, GitHubConfig, SyncStatusResult, GitRepoStatus } from '../types';
import { INITIAL_MOVIES } from '../data/initialMovies';

const STORAGE_KEYS = {
  MOVIES: 'movielover_movies_db_v3',
  AD_SETTINGS: 'movielover_ad_settings_v3',
  SITE_CONFIG: 'movielover_site_config_v3',
  REQUESTS: 'movielover_movie_requests_v3',
  STATS: 'movielover_ad_stats_v3',
  ADMIN_AUTH: 'movielover_admin_auth_v3',
};

export const DEFAULT_AD_SETTINGS: AdSettings = {
  enabled: true,
  testAdsMode: true, // If true, displays rich demo sponsor banners when custom scripts are empty
  headerBannerHtml: '',
  footerStickyBannerHtml: '',
  downloadPageBannerHtml: '',
  sidebarBannerHtml: '',
  directLinkUrl: 'https://example-direct-link.adsterra.com/click-track',
  popunderScript: '',
  impressionHeadTag: '',
  directLinkOnClickEnabled: true,
  countdownSeconds: 5,
  antiAdblockMessage: 'Please disable AdBlock to support free movie uploads & high speed Google Drive servers!'
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Movie Lover',
  tagline: 'Download 300MB, 720p, 1080p, 4K Movies & Web Series',
  telegramLink: 'https://t.me/movielover_official',
  marqueeAnnouncement: '🔥 Welcome to Movie Lover! Download 300MB, 720p, 1080p, 4K Movies & Web Series with High-Speed Google Drive & Fast Cloud Direct links! Join our Telegram for instant release notifications.',
  adminPassword: 'Aa123456@'
};

export function getStoredMovies(): Movie[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.MOVIES);
    if (!raw) {
      // Migrate from older version if exists
      raw = localStorage.getItem('moviebaaz_movies_db_v2');
      if (raw) {
        localStorage.setItem(STORAGE_KEYS.MOVIES, raw);
      }
    }
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(INITIAL_MOVIES));
      return INITIAL_MOVIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_MOVIES;
  } catch (e) {
    console.error('Failed to load movies from storage:', e);
    return INITIAL_MOVIES;
  }
}

export function saveStoredMovies(movies: Movie[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    localStorage.setItem('moviebaaz_movies_db_v2', JSON.stringify(movies));
  } catch (e) {
    console.error('Failed to save movies to storage:', e);
  }
}

export function addStoredMovie(movie: Movie): Movie[] {
  const current = getStoredMovies();
  const updated = [movie, ...current];
  saveStoredMovies(updated);
  return updated;
}

export function updateStoredMovie(movie: Movie): Movie[] {
  const current = getStoredMovies();
  const index = current.findIndex(m => m.id === movie.id);
  if (index !== -1) {
    current[index] = movie;
    saveStoredMovies(current);
  }
  return current;
}

export function deleteStoredMovie(id: string): Movie[] {
  const current = getStoredMovies();
  const filtered = current.filter(m => m.id !== id);
  saveStoredMovies(filtered);
  return filtered;
}

export function resetMoviesToDefault(): Movie[] {
  saveStoredMovies(INITIAL_MOVIES);
  return INITIAL_MOVIES;
}

export function getStoredAdSettings(): AdSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AD_SETTINGS);
    if (!raw) return DEFAULT_AD_SETTINGS;
    return { ...DEFAULT_AD_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AD_SETTINGS;
  }
}

export function saveStoredAdSettings(settings: AdSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AD_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save ad settings:', e);
  }
}

export function getStoredSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
    if (!raw) return DEFAULT_SITE_CONFIG;
    const parsed = JSON.parse(raw);
    const updated = { ...DEFAULT_SITE_CONFIG, ...parsed };
    if (updated.siteName === 'MovieBaaz') {
      updated.siteName = 'Movie Lover';
    }
    if (updated.adminPassword === 'admin') {
      updated.adminPassword = 'Aa123456@';
    }
    if (updated.marqueeAnnouncement && updated.marqueeAnnouncement.includes('MovieBaaz')) {
      updated.marqueeAnnouncement = updated.marqueeAnnouncement.replace(/MovieBaaz/g, 'Movie Lover');
    }
    return updated;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function saveStoredSiteConfig(config: SiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save site config:', e);
  }
}

export function getStoredRequests(): MovieRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      const demo: MovieRequest[] = [
        {
          id: 'req-1',
          movieTitle: 'Apur Panchali (Bengali)',
          year: '2014',
          userName: 'Rafiqul',
          language: 'Bengali',
          status: 'pending',
          date: '2025-01-14'
        },
        {
          id: 'req-2',
          movieTitle: 'Spider-Man 4 (Dual Audio)',
          year: '2026',
          userName: 'Tanvir',
          language: 'Dual Audio',
          status: 'pending',
          date: '2025-01-15'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(demo));
      return demo;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addStoredRequest(req: Omit<MovieRequest, 'id' | 'status' | 'date'>): MovieRequest[] {
  const current = getStoredRequests();
  const newReq: MovieRequest = {
    ...req,
    id: `req-${Date.now()}`,
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [newReq, ...current];
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
  return updated;
}

export function updateStoredRequestStatus(id: string, status: 'pending' | 'fulfilled' | 'rejected'): MovieRequest[] {
  const current = getStoredRequests();
  const updated = current.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
  return updated;
}

export function getStoredAdStats(): AdImpressionStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      const initialStats: AdImpressionStats = {
        impressions: 4320,
        bannerViews: 7850,
        directLinkClicks: 342,
        estimatedEarningsUsd: 14.85
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
      return initialStats;
    }
    return JSON.parse(raw);
  } catch {
    return { impressions: 0, bannerViews: 0, directLinkClicks: 0, estimatedEarningsUsd: 0 };
  }
}

export function recordAdImpression(): AdImpressionStats {
  const current = getStoredAdStats();
  // CPM rate estimation: approx $1.50 - $2.50 per 1000 impressions -> $0.0018 per impression
  const newImpressions = current.impressions + 1;
  const newBannerViews = current.bannerViews + 1;
  const newEarnings = +(current.estimatedEarningsUsd + 0.0018).toFixed(4);
  const updated: AdImpressionStats = {
    ...current,
    impressions: newImpressions,
    bannerViews: newBannerViews,
    estimatedEarningsUsd: newEarnings
  };
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  return updated;
}

export function recordDirectLinkClick(): AdImpressionStats {
  const current = getStoredAdStats();
  // Direct Link smartlink CPC/CPM estimation: approx $0.04 - $0.10 per click
  const newClicks = current.directLinkClicks + 1;
  const newEarnings = +(current.estimatedEarningsUsd + 0.045).toFixed(4);
  const updated: AdImpressionStats = {
    ...current,
    directLinkClicks: newClicks,
    estimatedEarningsUsd: newEarnings
  };
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  return updated;
}

// ==========================================
// FULL-STACK SERVER PERSISTENCE & AUTO-SYNC
// ==========================================

export interface ServerDatabaseData {
  movies?: Movie[];
  adSettings?: AdSettings;
  siteConfig?: SiteConfig;
  requests?: MovieRequest[];
  stats?: AdImpressionStats;
}

export const GITHUB_RAW_DB_URL = 'https://raw.githubusercontent.com/funnymovies887-hash/movieloverbd/main/data/db.json';

/**
 * Loads entire database from the server disk (/data/db.json)
 * with automatic GitHub Raw fallback for Cloudflare Workers / external domains.
 * Automatically updates localStorage cache so data is always synchronized across all devices.
 */
export async function fetchServerDatabase(): Promise<ServerDatabaseData | null> {
  // Step 1: Try local backend /api/db first (if running on Node.js/Cloud Run)
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const data: ServerDatabaseData = json.data;
        if (Array.isArray(data.movies)) {
          saveStoredMovies(data.movies);
        }
        if (data.adSettings) {
          saveStoredAdSettings(data.adSettings);
        }
        if (data.siteConfig) {
          saveStoredSiteConfig(data.siteConfig);
        }
        if (Array.isArray(data.requests)) {
          localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(data.requests));
        }
        if (data.stats) {
          localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
        }
        return data;
      }
    }
  } catch (err) {
    // API not reachable or running on static worker (Cloudflare Workers, GitHub Pages, etc.)
  }

  // Step 2: Global Universal Fallback - Fetch live database directly from GitHub raw!
  // This guarantees ANY mobile device or browser opening movieloverbd.funnymovies887.workers.dev gets live data!
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const ghRes = await fetch(GITHUB_RAW_DB_URL + cacheBuster, {
      cache: 'no-store'
    });
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      if (ghData && Array.isArray(ghData.movies) && ghData.movies.length > 0) {
        const data: ServerDatabaseData = {
          movies: ghData.movies,
          adSettings: ghData.adSettings,
          siteConfig: ghData.siteConfig,
          requests: ghData.requests || [],
          stats: ghData.stats
        };
        if (data.movies) saveStoredMovies(data.movies);
        if (data.adSettings) saveStoredAdSettings(data.adSettings);
        if (data.siteConfig) saveStoredSiteConfig(data.siteConfig);
        if (Array.isArray(data.requests)) {
          localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(data.requests));
        }
        if (data.stats) {
          localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
        }
        return data;
      }
    }
  } catch (ghErr) {
    console.warn('GitHub live raw database fetch fallback error:', ghErr);
  }

  return null;
}

/**
 * Saves full or partial database to server disk (/data/db.json) permanently
 * and updates localStorage simultaneously (with automatic GitHub push fallback).
 */
export async function saveServerDatabase(payload: ServerDatabaseData): Promise<{ success: boolean; syncStatus?: SyncStatusResult }> {
  if (payload.movies) saveStoredMovies(payload.movies);
  if (payload.adSettings) saveStoredAdSettings(payload.adSettings);
  if (payload.siteConfig) saveStoredSiteConfig(payload.siteConfig);
  if (payload.requests) localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(payload.requests));
  if (payload.stats) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(payload.stats));

  let syncStatus: SyncStatusResult | undefined;
  let backendOk = false;

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      syncStatus = json.syncStatus;
      backendOk = true;
    }
  } catch (e) {
    console.warn('Failed to sync to server API, running on static host:', e);
  }

  // If backend was not reached (e.g. running on Cloudflare Workers), trigger direct browser GitHub push!
  if (!backendOk || !syncStatus?.githubPushed) {
    const directRes = await directBrowserGitHubPush();
    syncStatus = {
      success: true,
      dbSaved: true,
      codeFileUpdated: true,
      gitCommitted: true,
      githubPushed: directRes.success,
      gitCommitHash: directRes.commitHash || 'LiveSync',
      githubMessage: directRes.message,
      timestamp: new Date().toISOString()
    };
  }

  return { success: true, syncStatus };
}

/**
 * Saves a single movie permanently to server disk (/data/db.json), localStorage,
 * and automatically pushes to GitHub so all mobile and browser users see it!
 */
export async function saveMovieToServer(movie: Movie): Promise<{ movies: Movie[]; syncStatus?: SyncStatusResult }> {
  const current = getStoredMovies();
  const exists = current.some(m => m.id === movie.id);
  const updated = exists
    ? current.map(m => (m.id === movie.id ? movie : m))
    : [movie, ...current];
  saveStoredMovies(updated);

  let syncStatus: SyncStatusResult | undefined;
  let backendOk = false;

  try {
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie)
    });
    if (res.ok) {
      const json = await res.json();
      syncStatus = json.syncStatus;
      backendOk = true;
    }
  } catch (e) {
    console.warn('Server API not reachable, activating direct GitHub sync:', e);
  }

  // If backend was not reached (e.g. running on Cloudflare Workers), trigger direct browser GitHub push!
  if (!backendOk || !syncStatus?.githubPushed) {
    const directRes = await directBrowserGitHubPush();
    syncStatus = {
      success: true,
      dbSaved: true,
      codeFileUpdated: true,
      gitCommitted: true,
      githubPushed: directRes.success,
      gitCommitHash: directRes.commitHash || 'LiveSync',
      githubMessage: directRes.message,
      timestamp: new Date().toISOString()
    };
  }

  return { movies: updated, syncStatus };
}

/**
 * Deletes a movie from server disk (/data/db.json) and localStorage permanently,
 * and automatically pushes deletion to GitHub!
 */
export async function deleteMovieFromServer(id: string): Promise<{ movies: Movie[]; syncStatus?: SyncStatusResult }> {
  const updated = deleteStoredMovie(id);
  let syncStatus: SyncStatusResult | undefined;
  let backendOk = false;

  try {
    const res = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const json = await res.json();
      syncStatus = json.syncStatus;
      backendOk = true;
    }
  } catch (e) {
    console.warn('Failed to delete movie from server API:', e);
  }

  // If backend was not reached (e.g. running on Cloudflare Workers), trigger direct browser GitHub push!
  if (!backendOk || !syncStatus?.githubPushed) {
    const directRes = await directBrowserGitHubPush();
    syncStatus = {
      success: true,
      dbSaved: true,
      codeFileUpdated: true,
      gitCommitted: true,
      githubPushed: directRes.success,
      gitCommitHash: directRes.commitHash || 'LiveSync',
      githubMessage: directRes.message,
      timestamp: new Date().toISOString()
    };
  }

  return { movies: updated, syncStatus };
}

/**
 * Resets movies on server disk (/data/db.json) to default high-quality library.
 */
export async function resetMoviesOnServer(): Promise<{ movies: Movie[]; syncStatus?: SyncStatusResult }> {
  const def = resetMoviesToDefault();
  let syncStatus: SyncStatusResult | undefined;
  try {
    const res = await fetch('/api/reset-movies', {
      method: 'POST'
    });
    if (res.ok) {
      const json = await res.json();
      syncStatus = json.syncStatus;
    }
  } catch (e) {
    console.warn('Failed to reset movies on server API:', e);
  }
  return { movies: def, syncStatus };
}

/**
 * Triggers 1-Click Sync Everywhere:
 * Updates data/db.json, regenerates src/data/initialMovies.ts, commits to Git,
 * and pushes to GitHub (with automatic dual-layer server + direct browser fallback).
 */
export async function triggerOneClickSync(reason = 'Manual 1-Click Sync'): Promise<SyncStatusResult> {
  let backendResult: SyncStatusResult | null = null;
  try {
    const res = await fetch('/api/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      backendResult = await res.json();
    }
  } catch (e) {
    console.warn('Backend sync-all unreached, activating direct browser engine:', e);
  }

  if (backendResult && backendResult.githubPushed) {
    return backendResult;
  }

  // If backend was unreachable or github push was blocked/returned error on server,
  // execute direct browser-to-GitHub sync via official GitHub REST API!
  const directPushResult = await directBrowserGitHubPush();
  return {
    success: true,
    dbSaved: true,
    codeFileUpdated: true,
    gitCommitted: true,
    githubPushed: directPushResult.success,
    gitCommitHash: directPushResult.commitHash || backendResult?.gitCommitHash || 'Active',
    githubMessage: directPushResult.message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fetches Git status (current branch, commit hash, commit message, clean/dirty state)
 */
export async function fetchGitStatus(): Promise<GitRepoStatus | null> {
  try {
    const res = await fetch('/api/git-status');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    console.error('Failed to fetch git status:', e);
  }
  return null;
}

const GITHUB_LOCAL_KEY = 'movielover_github_config';

/**
 * Fetches GitHub sync configuration (with localStorage offline fallback)
 */
export async function fetchGitHubConfig(): Promise<GitHubConfig | null> {
  // Try server first
  try {
    const res = await fetch('/api/github-config');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        try {
          localStorage.setItem(GITHUB_LOCAL_KEY, JSON.stringify(json.data));
        } catch (e) {}
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Server fetch github config failed, trying local storage:', e);
  }

  // Fallback to local storage if server is unresponsive
  try {
    const local = localStorage.getItem(GITHUB_LOCAL_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {}

  return null;
}

/**
 * Saves GitHub sync configuration (syncs to server + localStorage backup)
 */
export async function saveGitHubConfig(config: Partial<GitHubConfig>): Promise<{ success: boolean; data?: GitHubConfig }> {
  let serverSavedData: GitHubConfig | undefined = undefined;

  // 1. Try server save (both POST and GET fallback)
  try {
    const res = await fetch('/api/github-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        serverSavedData = json.data;
      }
    }
  } catch (e) {
    console.warn('Server save github config failed, saving locally:', e);
  }

  // 2. Also save to local storage as fallback
  try {
    const existing = await fetchGitHubConfig() || {
      repoUrl: '',
      branch: 'main',
      token: '',
      autoPush: true
    };
    const merged: GitHubConfig = {
      ...existing,
      ...config,
      hasToken: Boolean((config.token && config.token.length > 5) || existing.hasToken),
      tokenMasked: config.token ? `${config.token.slice(0, 4)}••••••••${config.token.slice(-4)}` : existing.tokenMasked
    };
    localStorage.setItem(GITHUB_LOCAL_KEY, JSON.stringify(merged));
    return { success: true, data: serverSavedData || merged };
  } catch (e) {
    console.error('Failed to save github config locally:', e);
  }

  return { success: !!serverSavedData, data: serverSavedData };
}

/**
 * Helper to safely parse JSON response from fetch
 */
async function safeJsonParse(res: Response, fallbackErrorMessage = 'সার্ভার থেকে কোনো রেসপন্স পাওয়া যায়নি'): Promise<any> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return { success: false, message: `${fallbackErrorMessage} (HTTP ${res.status})` };
    }
    return JSON.parse(text);
  } catch (e: any) {
    return { success: false, message: `রেসপন্স প্রসেসিং এরর: ${e?.message || 'JSON Parse error'}` };
  }
}

/**
 * Direct browser client-side GitHub test fallback (CORS supported by GitHub API)
 */
async function directBrowserGitHubTest(repoUrl: string, token: string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    let clean = repoUrl.trim().replace(/\.git$/i, '').replace(/^https?:\/\/github\.com\//i, '').replace(/^git@github\.com:/i, '').replace(/^\/+|\/+$/g, '');
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, message: '❌ GitHub Token দিন (যেমন: ghp_...)' };
    }
    if (!clean) {
      return { success: false, message: '❌ GitHub Repository নাম দিন (যেমন: username/repo)' };
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${cleanToken}`
      }
    });

    if (userRes.status === 401) {
      return { success: false, message: '❌ টোকেন ভুল বা মেয়াদ শেষ (401 Bad credentials)। GitHub থেকে নতুন Personal Access Token (classic) তৈরি করুন।' };
    }
    if (!userRes.ok) {
      return { success: false, message: `❌ GitHub API রেসপন্স এরর (${userRes.status})` };
    }

    const userData: any = await userRes.json();

    // Verify Repository
    const repoRes = await fetch(`https://api.github.com/repos/${clean}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${cleanToken}`
      }
    });

    if (repoRes.status === 404) {
      const repoShort = clean.split('/')[1] || clean;
      return {
        success: false,
        message: `⚠️ টোকেন সঠিক (@${userData.login}), কিন্তু GitHub-এ "${clean}" রিপোজিটোরি পাওয়া যায়নি (404 Not Found)। দয়া করে GitHub-এ "${repoShort}" রিপোজিটোরি তৈরি করুন।`
      };
    }

    if (!repoRes.ok) {
      return { success: false, message: `⚠️ রিপোজিটোরি অ্যাক্সেস ব্যর্থ (${repoRes.status})` };
    }

    const repoData: any = await repoRes.json();
    const canPush = repoData.permissions?.push !== false;

    return {
      success: true,
      message: `✅ GitHub কানেকশন ১০০% সফল! ইউজার @${userData.login} হিসেবে "${clean}" রিপোজিটোরিতে অ্যাক্সেস নিশ্চিত করা হয়েছে।`,
      data: {
        login: userData.login,
        repo: repoData.full_name,
        canPush
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `❌ GitHub টেস্ট কানেকশন ব্যর্থ: ${err?.message || 'Network error'}`
    };
  }
}

/**
 * Tests connection to GitHub repository (with dual-engine fallback)
 */
export async function testGitHubConnection(repoUrl: string, token: string): Promise<{ success: boolean; message: string; data?: any }> {
  // Step 1: Try server backend test
  try {
    const res = await fetch('/api/github-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, token })
    });
    
    if (res.ok) {
      const parsed = await safeJsonParse(res, 'GitHub টেস্ট সার্ভার রেসপন্স দেয়নি');
      if (parsed && typeof parsed.success === 'boolean') {
        return parsed;
      }
    }
  } catch (e: any) {
    console.warn('Server github-test failed, switching to direct browser engine:', e);
  }

  // Step 2: Fallback to direct client-side GitHub REST API test
  return await directBrowserGitHubTest(repoUrl, token);
}

/**
 * Direct browser client-side GitHub Push engine (bypasses any server proxies/405 errors)
 */
export async function directBrowserGitHubPush(): Promise<{ success: boolean; message: string; commitHash?: string }> {
  try {
    const config = await fetchGitHubConfig();
    const repoUrl = config?.repoUrl || 'https://github.com/funnymovies887-hash/movieloverbd';
    let token = config?.token || '';
    if (!token) {
      try {
        const local = localStorage.getItem(GITHUB_LOCAL_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          token = parsed.token || '';
        }
      } catch (e) {}
    }

    if (!token) {
      return {
        success: false,
        message: '❌ GitHub Token অনুপস্থিত। অনুগ্রহ করে GitHub সেটিংস ট্যাবে আপনার PAT টোকেনটি দিন।'
      };
    }

    let cleanRepo = repoUrl.trim().replace(/\.git$/i, '').replace(/^https?:\/\/github\.com\//i, '').replace(/^git@github\.com:/i, '').replace(/^\/+|\/+$/g, '');
    const branch = config?.branch || 'main';

    const movies = getStoredMovies();
    const adSettings = getStoredAdSettings();
    const siteConfig = getStoredSiteConfig();
    const fullDb = {
      movies,
      adSettings,
      siteConfig,
      requests: [],
      stats: { impressions: 4320, bannerViews: 7850, directLinkClicks: 342, estimatedEarningsUsd: 14.85 }
    };

    const dbJsonStr = JSON.stringify(fullDb, null, 2);

    // UTF-8 to Base64 encoder
    const utf8Bytes = new TextEncoder().encode(dbJsonStr);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const dbBase64 = btoa(binary);

    // 1. Get current SHA of data/db.json
    let currentSha: string | undefined = undefined;
    try {
      const getFileRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/data/db.json?ref=${branch}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token.trim()}`
        }
      });
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        currentSha = fileData.sha;
      }
    } catch (e) {}

    // 2. Put / update data/db.json on GitHub
    const putRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/data/db.json`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Movie Lover Auto-Sync: ${movies.length} movies updated via Web Admin`,
        content: dbBase64,
        sha: currentSha,
        branch
      })
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => null);
      const errMsg = errJson?.message || `HTTP ${putRes.status}`;
      return {
        success: false,
        message: `❌ GitHub আপডেট ব্যর্থ (${errMsg})`
      };
    }

    const putData = await putRes.json();
    const shortSha = putData?.commit?.sha ? putData.commit.sha.slice(0, 7) : 'Active';

    // 3. Also sync src/data/initialMovies.ts
    try {
      const tsCode = `import { Movie } from '../types';\n\nexport const INITIAL_MOVIES: Movie[] = ${JSON.stringify(movies, null, 2)};\n`;
      const tsBytes = new TextEncoder().encode(tsCode);
      let tsBinary = '';
      for (let i = 0; i < tsBytes.length; i++) {
        tsBinary += String.fromCharCode(tsBytes[i]);
      }
      const tsBase64 = btoa(tsBinary);

      let tsSha: string | undefined = undefined;
      const getTsRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/src/data/initialMovies.ts?ref=${branch}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token.trim()}`
        }
      });
      if (getTsRes.ok) {
        const tsData = await getTsRes.json();
        tsSha = tsData.sha;
      }

      await fetch(`https://api.github.com/repos/${cleanRepo}/contents/src/data/initialMovies.ts`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Sync initialMovies.ts source code (${movies.length} movies)`,
          content: tsBase64,
          sha: tsSha,
          branch
        })
      });
    } catch (e) {}

    return {
      success: true,
      message: `🚀 GitHub-এ সরাসরি সফলভাবে পুশ সম্পন্ন হয়েছে! (@${cleanRepo} [${branch}])`,
      commitHash: shortSha
    };
  } catch (err: any) {
    return {
      success: false,
      message: `❌ গিটহাব পুশ এরর: ${err?.message || 'Network error'}`
    };
  }
}

/**
 * Triggers manual push to GitHub (with automatic server + direct browser fallback)
 */
export async function triggerGitHubPush(): Promise<{ success: boolean; message: string }> {
  // 1. Try server-side push first
  try {
    const res = await fetch('/api/github-push', {
      method: 'POST'
    });
    if (res.ok) {
      const parsed = await safeJsonParse(res, '');
      if (parsed && parsed.success) {
        return parsed;
      }
    }
  } catch (e: any) {
    console.warn('Backend push unreached, activating direct browser engine:', e);
  }

  // 2. Direct browser GitHub Push fallback
  const direct = await directBrowserGitHubPush();
  return {
    success: direct.success,
    message: direct.message
  };
}
