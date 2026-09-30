export interface MovieServer {
  name: string;
  url: string;
  type?: 'gdrive' | 'direct' | 'cloud' | 'torrent' | 'mega';
}

export interface MovieDownloadOption {
  quality: string; // '480p' | '720p' | '1080p' | '4K UHD'
  size: string;    // '450 MB', '1.2 GB', '2.6 GB', '6.8 GB'
  format: string;  // 'MKV x264 AAC', '10Bit HEVC', 'x265'
  servers: MovieServer[];
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  slug: string;
  category: 'bengali' | 'bollywood' | 'south' | 'hollywood' | 'webseries' | 'anime';
  year: number;
  rating: number; // e.g. 7.9
  quality: string[]; // ['480p', '720p', '1080p', '4K']
  languages: string[]; // ['Bengali', 'Hindi Dubbed', 'Dual Audio (Eng-Hin)']
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  duration: string;
  releaseDate: string;
  director: string;
  cast: string[];
  synopsis: string;
  screenshots: string[];
  downloadOptions: MovieDownloadOption[];
  streamUrl?: string; // YouTube trailer or direct stream embed
  views: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt: string;
}

export interface AdSettings {
  enabled: boolean;
  testAdsMode: boolean; // Show simulated placeholder ads if user has not yet added real codes
  headerBannerHtml: string; // e.g. 728x90 Adsterra or Monetag script/html
  footerStickyBannerHtml: string; // e.g. 728x90 or 320x50 sticky bottom banner
  downloadPageBannerHtml: string; // e.g. 300x250 or responsive banner
  sidebarBannerHtml: string;
  directLinkUrl: string; // Smartlink / Direct Link for download buttons
  popunderScript: string; // Popunder JS tag
  impressionHeadTag: string; // Header verification / Social Bar / In-page Push script
  directLinkOnClickEnabled: boolean; // Open direct link in background when user clicks download
  countdownSeconds: number; // Countdown before download button appears (default: 5)
  antiAdblockMessage: string;
}

export interface MovieRequest {
  id: string;
  movieTitle: string;
  year?: string;
  userName?: string;
  language?: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  date: string;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  telegramLink: string;
  marqueeAnnouncement: string;
  adminPassword: string;
}

export interface AdImpressionStats {
  impressions: number;
  bannerViews: number;
  directLinkClicks: number;
  estimatedEarningsUsd: number;
}

export interface GitHubConfig {
  repoUrl: string; // e.g. "funnymovies887/movielover" or "https://github.com/..."
  branch: string;  // e.g. "main"
  token: string;   // GitHub PAT token
  tokenMasked?: string;
  autoPush: boolean;
  hasToken?: boolean;
  lastPushStatus?: string;
  lastPushTime?: string;
}

export interface SyncStatusResult {
  success: boolean;
  dbSaved: boolean;
  codeFileUpdated: boolean;
  gitCommitted: boolean;
  gitCommitHash?: string;
  githubPushed: boolean;
  githubMessage?: string;
  timestamp: string;
}

export interface GitRepoStatus {
  branch: string;
  lastCommitHash: string;
  lastCommitMessage: string;
  lastCommitDate: string;
  clean: boolean;
  uncommittedFiles: string[];
}
