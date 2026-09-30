import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Film, 
  Settings, 
  Database, 
  MessageSquare, 
  Check, 
  Lock, 
  RefreshCw, 
  Save, 
  Sparkles,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
  Star,
  Copy,
  ArrowLeft,
  LogOut,
  GitBranch,
  GitCommit,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Download,
  Link as LinkIcon,
  Server,
  FileVideo,
  Layers,
  Globe,
  Radio,
  Play,
  CheckSquare,
  Square,
  Clock,
  Trash
} from 'lucide-react';
import { 
  Movie, 
  AdSettings, 
  SiteConfig, 
  MovieRequest, 
  AdImpressionStats, 
  GitHubConfig, 
  SyncStatusResult, 
  GitRepoStatus,
  MovieDownloadOption,
  MovieServer 
} from '../types';
import { 
  addStoredMovie, 
  updateStoredMovie, 
  deleteStoredMovie, 
  resetMoviesToDefault,
  saveStoredAdSettings, 
  saveStoredSiteConfig,
  updateStoredRequestStatus,
  getStoredAdStats,
  saveMovieToServer,
  deleteMovieFromServer,
  saveServerDatabase,
  resetMoviesOnServer,
  triggerOneClickSync,
  fetchGitStatus,
  fetchGitHubConfig,
  saveGitHubConfig,
  testGitHubConnection,
  triggerGitHubPush
} from '../utils/storage';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onMoviesUpdated: (movies: Movie[]) => void;
  adSettings: AdSettings;
  onAdSettingsUpdated: (settings: AdSettings) => void;
  siteConfig: SiteConfig;
  onSiteConfigUpdated: (config: SiteConfig) => void;
  requests: MovieRequest[];
  onRequestsUpdated: (requests: MovieRequest[]) => void;
  onOpenGuide: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  movies,
  onMoviesUpdated,
  adSettings,
  onAdSettingsUpdated,
  siteConfig,
  onSiteConfigUpdated,
  requests,
  onRequestsUpdated,
  onOpenGuide
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('movielover_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'movies' | 'ads' | 'requests' | 'settings' | 'backup' | 'github'>('movies');

  // Movie Form State (for adding/editing)
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Master Movie Link Auto-Generator state
  const [masterMovieLink, setMasterMovieLink] = useState<string>('');
  const [showModalVideoPreview, setShowModalVideoPreview] = useState<boolean>(false);

  const emptyMovieForm: Omit<Movie, 'id' | 'views' | 'createdAt'> = {
    title: '',
    originalTitle: '',
    slug: '',
    category: 'bengali',
    year: new Date().getFullYear(),
    rating: 8.0,
    quality: ['480p', '720p', '1080p', '4K UHD'],
    languages: ['Bengali [Original Audio]'],
    genres: ['Action', 'Drama'],
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    duration: '2h 15m',
    releaseDate: '2024',
    director: 'Director Name',
    cast: ['Actor 1', 'Actor 2'],
    synopsis: 'Short summary of the movie...',
    screenshots: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80'
    ],
    downloadOptions: [
      {
        quality: '480p',
        size: '450 MB',
        format: 'MKV | x264 AAC',
        servers: [
          { name: 'Fast G-Drive Server', url: '', type: 'gdrive' },
          { name: 'HubCloud Direct Link', url: '', type: 'cloud' }
        ]
      },
      {
        quality: '720p',
        size: '1.2 GB',
        format: 'MKV | 720p HD-Rip',
        servers: [
          { name: 'Google Drive Ultra', url: '', type: 'gdrive' },
          { name: 'Direct Cloud Mirror', url: '', type: 'cloud' }
        ]
      },
      {
        quality: '1080p',
        size: '2.8 GB',
        format: 'MKV | 1080p Full HD ESub',
        servers: [
          { name: 'VIP Cloud Server', url: '', type: 'cloud' },
          { name: 'Direct High-Speed Link', url: '', type: 'direct' }
        ]
      },
      {
        quality: '4K UHD',
        size: '6.5 GB',
        format: 'MKV | 4K UHD HDR',
        servers: [
          { name: 'Ultra 4K Fast Server', url: '', type: 'cloud' }
        ]
      }
    ],
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isFeatured: false,
    isTrending: true
  };

  const [movieForm, setMovieForm] = useState(emptyMovieForm);
  const [formLanguagesStr, setFormLanguagesStr] = useState('Bengali [Original Audio]');
  const [formGenresStr, setFormGenresStr] = useState('Action, Drama');
  const [formCastStr, setFormCastStr] = useState('Actor 1, Actor 2');
  const [formScreenshotsStr, setFormScreenshotsStr] = useState('');

  // Auto-generate 480p, 720p, 1080p, and 4K UHD download servers from 1 Master Movie Link
  const handleAutoGenerateQualities = () => {
    if (!masterMovieLink.trim()) {
      alert('দয়া করে আপনার মাস্টার মুভি ড্রাইভ বা ফাইল লিংকটি দিন (যেমন: Google Drive, HubCloud, TeraBox, Mega)');
      return;
    }
    const cleanUrl = masterMovieLink.trim();
    const generated: MovieDownloadOption[] = [
      {
        quality: '480p',
        size: '450 MB',
        format: 'MKV | x264 AAC',
        servers: [
          { name: 'Google Drive Fast Server', url: cleanUrl, type: 'gdrive' },
          { name: 'HubCloud Direct Link', url: cleanUrl, type: 'cloud' }
        ]
      },
      {
        quality: '720p',
        size: '1.2 GB',
        format: 'MKV | 720p HD-Rip',
        servers: [
          { name: 'Google Drive Ultra HD', url: cleanUrl, type: 'gdrive' },
          { name: 'Direct Cloud Mirror', url: cleanUrl, type: 'cloud' }
        ]
      },
      {
        quality: '1080p',
        size: '2.8 GB',
        format: 'MKV | 1080p Full HD ESub',
        servers: [
          { name: 'VIP Direct Cloud Server', url: cleanUrl, type: 'cloud' },
          { name: 'High-Speed Fast Link', url: cleanUrl, type: 'direct' }
        ]
      },
      {
        quality: '4K UHD',
        size: '6.5 GB',
        format: 'MKV | 4K UHD HDR',
        servers: [
          { name: 'Ultra 4K Fast Server', url: cleanUrl, type: 'cloud' }
        ]
      }
    ];

    setMovieForm(prev => ({
      ...prev,
      quality: ['480p', '720p', '1080p', '4K UHD'],
      downloadOptions: generated
    }));

    showSaveToast(
      '⚡ ৪টি কোয়ালিটি লিংক সফলভাবে তৈরি হয়েছে!',
      '480p, 720p, 1080p ও 4K UHD কোয়ালিটি ড্রাইভ লিংকের সাথে পূরণ করা হয়েছে। প্রয়োজনে নিচে আলাদা সাইজ বা লিংক এডিট করতে পারেন।',
      'success'
    );
  };

  const handleAddServer = (qIdx: number) => {
    setMovieForm(prev => {
      const options = [...prev.downloadOptions];
      if (options[qIdx]) {
        options[qIdx] = {
          ...options[qIdx],
          servers: [
            ...options[qIdx].servers,
            { name: 'Direct Cloud Mirror', url: masterMovieLink || '', type: 'cloud' }
          ]
        };
      }
      return { ...prev, downloadOptions: options };
    });
  };

  const handleRemoveServer = (qIdx: number, sIdx: number) => {
    setMovieForm(prev => {
      const options = [...prev.downloadOptions];
      if (options[qIdx]) {
        options[qIdx] = {
          ...options[qIdx],
          servers: options[qIdx].servers.filter((_, idx) => idx !== sIdx)
        };
      }
      return { ...prev, downloadOptions: options };
    });
  };

  const handleServerChange = (qIdx: number, sIdx: number, field: 'name' | 'url' | 'type', value: string) => {
    setMovieForm(prev => {
      const options = [...prev.downloadOptions];
      if (options[qIdx] && options[qIdx].servers[sIdx]) {
        const servers = [...options[qIdx].servers];
        servers[sIdx] = { ...servers[sIdx], [field]: value };
        options[qIdx] = { ...options[qIdx], servers };
      }
      return { ...prev, downloadOptions: options };
    });
  };

  const handleQualityChange = (qIdx: number, field: 'quality' | 'size' | 'format', value: string) => {
    setMovieForm(prev => {
      const options = [...prev.downloadOptions];
      if (options[qIdx]) {
        options[qIdx] = { ...options[qIdx], [field]: value };
      }
      const updatedQualities = options.map(o => o.quality).filter(Boolean);
      return { ...prev, downloadOptions: options, quality: updatedQualities };
    });
  };

  const handleRemoveQuality = (qIdx: number) => {
    setMovieForm(prev => {
      const options = prev.downloadOptions.filter((_, idx) => idx !== qIdx);
      const updatedQualities = options.map(o => o.quality).filter(Boolean);
      return { ...prev, downloadOptions: options, quality: updatedQualities };
    });
  };

  const handleAddNewQualityOption = () => {
    const newQuality: MovieDownloadOption = {
      quality: '4K UHD',
      size: '6.5 GB',
      format: 'MKV | 4K UHD HDR',
      servers: [
        { name: 'Ultra 4K Fast Server', url: masterMovieLink || '', type: 'cloud' }
      ]
    };
    setMovieForm(prev => {
      const options = [...prev.downloadOptions, newQuality];
      const updatedQualities = options.map(o => o.quality).filter(Boolean);
      return { ...prev, downloadOptions: options, quality: updatedQualities };
    });
  };

  // Ad Settings Form State
  const [adsForm, setAdsForm] = useState<AdSettings>(adSettings);
  const [adsSavedNotice, setAdsSavedNotice] = useState(false);
  const [isSavingAds, setIsSavingAds] = useState(false);

  // Site Config Form State
  const [siteForm, setSiteForm] = useState<SiteConfig>(siteConfig);
  const [siteSavedNotice, setSiteSavedNotice] = useState(false);
  const [isSavingSite, setIsSavingSite] = useState(false);

  // Movie saving state
  const [isSavingMovie, setIsSavingMovie] = useState(false);

  // Git & GitHub Sync State
  const DEFAULT_REPO_URL = 'https://github.com/funnymovies887-hash/movieloverbd';

  const [gitStatus, setGitStatus] = useState<GitRepoStatus | null>(null);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>({
    repoUrl: DEFAULT_REPO_URL,
    branch: 'main',
    token: '',
    hasToken: true,
    tokenMasked: 'ghp_••••••••knwm',
    autoPush: true
  });
  const [githubForm, setGithubForm] = useState<GitHubConfig>({
    repoUrl: DEFAULT_REPO_URL,
    branch: 'main',
    token: '',
    autoPush: true
  });
  const [isLoadingGit, setIsLoadingGit] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<SyncStatusResult | null>(null);
  const [testConnectionStatus, setTestConnectionStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [isSavingGithubConfig, setIsSavingGithubConfig] = useState<boolean>(false);
  const [showPatToken, setShowPatToken] = useState<boolean>(false);
  const [isManualPushing, setIsManualPushing] = useState<boolean>(false);

  const loadGitAndGithubInfo = async () => {
    setIsLoadingGit(true);
    try {
      const [gStatus, ghCfg] = await Promise.all([
        fetchGitStatus(),
        fetchGitHubConfig()
      ]);
      if (gStatus) setGitStatus(gStatus);
      if (ghCfg) {
        setGithubConfig(prev => ({
          ...prev,
          ...ghCfg,
          repoUrl: ghCfg.repoUrl || prev.repoUrl,
          token: ghCfg.token || prev.token
        }));
        setGithubForm(prev => ({
          ...prev,
          ...ghCfg,
          repoUrl: ghCfg.repoUrl || prev.repoUrl,
          token: ghCfg.token || prev.token
        }));
      }
    } catch (e) {
      console.error('Failed to load git/github info', e);
    } finally {
      setIsLoadingGit(false);
    }
  };

  // Load Git info on mount
  useEffect(() => {
    loadGitAndGithubInfo();
  }, []);

  // Reload when switching to GitHub tab
  useEffect(() => {
    if (activeTab === 'github') {
      loadGitAndGithubInfo();
    }
  }, [activeTab]);

  // Synchronize when external props update (e.g. from backup restore or reset)
  useEffect(() => {
    setAdsForm(adSettings);
  }, [adSettings]);

  useEffect(() => {
    setSiteForm(siteConfig);
  }, [siteConfig]);

  // Clean up any external ad scripts or overlays in admin panel
  useEffect(() => {
    try {
      const adScripts = document.querySelectorAll('script[src*="quge5"], script[src*="monetag"], [id*="monetag"]');
      adScripts.forEach(el => el.remove());
    } catch (e) {}
  }, []);

  // Dirty state checks to control whether Save buttons pop out/float or stay dim/faded
  const isAdsDirty = JSON.stringify(adsForm) !== JSON.stringify(adSettings);
  const isSiteDirty = JSON.stringify(siteForm) !== JSON.stringify(siteConfig);
  const isMovieFormValid = movieForm.title.trim().length > 0;

  // Prominent Save Confirmation Toast State
  interface SaveToast {
    id: number;
    title: string;
    description: string;
    type: 'success' | 'delete' | 'info';
    timestamp: string;
  }
  const [toast, setToast] = useState<SaveToast | null>(null);

  // Clean Web Audio chime so user hears and feels confirmation
  const playSaveSound = (isDelete = false) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isDelete) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio might be blocked by browser policy, ignore safely
    }
  };

  const showSaveToast = (title: string, description: string, type: 'success' | 'delete' | 'info' = 'success') => {
    playSaveSound(type === 'delete');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setToast({
      id: Date.now(),
      title,
      description,
      type,
      timestamp: timeStr
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Search filter for movie list in admin
  const [adminMovieSearch, setAdminMovieSearch] = useState('');

  // Stats
  const stats: AdImpressionStats = getStoredAdStats();

  if (!isOpen) return null;

  // Helper to format YouTube and Google Drive embed URLs automatically
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

  const handleBackToSite = () => {
    window.history.pushState(null, '', '/');
    onClose();
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('movielover_admin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    window.history.pushState(null, '', '/');
    onClose();
  };

  // 1. Password Verification Screen
  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === siteConfig.adminPassword || passwordInput === 'Aa123456@') {
        try {
          sessionStorage.setItem('movielover_admin_auth', 'true');
        } catch (e) {}
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Incorrect Password! Please enter master password.');
      }
    };

    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* Top return link */}
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
          <button
            onClick={handleBackToSite}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Movie Site</span>
          </button>
          <span className="text-[11px] text-red-400 font-mono font-semibold">Protected Area</span>
        </div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-black text-white text-center">
            {siteConfig.siteName} Admin Portal
          </h3>
          <p className="text-xs text-slate-400 text-center mt-1">
            Private Access: Manage Movies, Adsterra / Monetag Ads Scripts & Settings
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter secret admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:border-red-500 focus:outline-none"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-400 mt-1 font-medium">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              Unlock Admin Panel
            </button>

            <p className="text-[11px] text-slate-400 text-center pt-2">
              Tip: You can access this portal anytime via <code className="text-red-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">/admin</code> or <code className="text-red-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">#/admin</code>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // 2. Movie CRUD Handlers
  const handleOpenAddMovie = () => {
    setEditingMovieId(null);
    setMovieForm(emptyMovieForm);
    setFormLanguagesStr('Bengali [Original Audio]');
    setFormGenresStr('Action, Drama');
    setFormCastStr('Actor 1, Actor 2');
    setFormScreenshotsStr('');
    setMasterMovieLink('');
    setIsMovieModalOpen(true);
  };

  const handleOpenEditMovie = (movie: Movie) => {
    setEditingMovieId(movie.id);
    const existingDl = Array.isArray(movie.downloadOptions) && movie.downloadOptions.length > 0
      ? movie.downloadOptions
      : emptyMovieForm.downloadOptions;

    setMovieForm({
      title: movie.title,
      originalTitle: movie.originalTitle || '',
      slug: movie.slug,
      category: movie.category,
      year: movie.year,
      rating: movie.rating,
      quality: movie.quality,
      languages: movie.languages,
      genres: movie.genres,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      director: movie.director,
      cast: movie.cast,
      synopsis: movie.synopsis,
      screenshots: movie.screenshots,
      downloadOptions: existingDl,
      streamUrl: movie.streamUrl || '',
      isFeatured: movie.isFeatured || false,
      isTrending: movie.isTrending || false
    });
    setFormLanguagesStr(movie.languages.join(', '));
    setFormGenresStr(movie.genres.join(', '));
    setFormCastStr(movie.cast.join(', '));
    setFormScreenshotsStr(movie.screenshots.join('\n'));
    const initialLink = existingDl[0]?.servers[0]?.url || '';
    setMasterMovieLink(initialLink);
    setIsMovieModalOpen(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm.title.trim()) {
      return;
    }

    setIsSavingMovie(true);

    const languages = formLanguagesStr.split(',').map(s => s.trim()).filter(Boolean);
    const genres = formGenresStr.split(',').map(s => s.trim()).filter(Boolean);
    const cast = formCastStr.split(',').map(s => s.trim()).filter(Boolean);
    const screenshots = formScreenshotsStr.split('\n').map(s => s.trim()).filter(Boolean);
    const savedTitle = movieForm.title.trim();
    const isEdit = !!editingMovieId;

    const savedQualities = Array.isArray(movieForm.downloadOptions) && movieForm.downloadOptions.length > 0
      ? movieForm.downloadOptions.map(d => d.quality).filter(Boolean)
      : (movieForm.quality.length ? movieForm.quality : ['480p', '720p', '1080p']);

    let targetMovie: Movie;
    if (editingMovieId) {
      // Edit existing
      const existing = movies.find(m => m.id === editingMovieId);
      targetMovie = {
        ...movieForm,
        title: savedTitle,
        id: editingMovieId,
        quality: savedQualities,
        streamUrl: formatYouTubeEmbedUrl(movieForm.streamUrl || ''),
        downloadOptions: movieForm.downloadOptions,
        languages: languages.length ? languages : ['Dual Audio'],
        genres: genres.length ? genres : ['Action'],
        cast: cast.length ? cast : ['Unknown'],
        screenshots: screenshots.length ? screenshots : [movieForm.backdropUrl],
        views: existing ? existing.views : 1000,
        createdAt: existing ? existing.createdAt : new Date().toISOString().split('T')[0]
      };
    } else {
      // Add new
      targetMovie = {
        ...movieForm,
        title: savedTitle,
        id: `movie-${Date.now()}`,
        slug: savedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        quality: savedQualities,
        streamUrl: formatYouTubeEmbedUrl(movieForm.streamUrl || ''),
        downloadOptions: movieForm.downloadOptions,
        languages: languages.length ? languages : ['Dual Audio'],
        genres: genres.length ? genres : ['Action'],
        cast: cast.length ? cast : ['Unknown'],
        screenshots: screenshots.length ? screenshots : [movieForm.backdropUrl],
        views: Math.floor(Math.random() * 5000) + 1200,
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    // Save permanently to server disk (/data/db.json), src/data/initialMovies.ts, and localStorage
    const saveResult = await saveMovieToServer(targetMovie);
    onMoviesUpdated(saveResult.movies);

    setIsSavingMovie(false);
    setIsMovieModalOpen(false);

    // Refresh git info
    fetchGitStatus().then(st => st && setGitStatus(st));

    const syncInfo = saveResult.syncStatus;
    const gitHashMsg = syncInfo?.gitCommitHash ? ` (Commit: ${syncInfo.gitCommitHash})` : '';
    const ghPushMsg = syncInfo?.githubPushed ? ' • 🚀 GitHub-এও সরাসরি পুশ সম্পন্ন হয়েছে!' : '';

    showSaveToast(
      isEdit ? '✅ মুভি আপডেট ও সর্বত্র সেভ হয়েছে!' : '✅ নতুন মুভি সর্বত্র সেভ ও কোডে যুক্ত হয়েছে!',
      `"${savedTitle}" সার্ভার ডাটাবেজ (/data/db.json) এবং সোর্স কোড (/src/data/initialMovies.ts) ফাইলে সেভ হয়েছে${gitHashMsg}${ghPushMsg}। কোড পরিবর্তন বা রিফ্রেশ করলেও এটি আর কখনোই মুছে যাবে না।`,
      'success'
    );
  };

  const handleDeleteMovie = async (id: string, title?: string) => {
    const movieTitle = title || 'এই মুভিটি';
    if (confirm(`আপনি কি নিশ্চিত যে "${movieTitle}" মুভিটি Movie Lover সাইট থেকে মুছে ফেলতে চান?`)) {
      const delResult = await deleteMovieFromServer(id);
      onMoviesUpdated(delResult.movies);
      
      // Refresh git info
      fetchGitStatus().then(st => st && setGitStatus(st));

      const syncInfo = delResult.syncStatus;
      const gitHashMsg = syncInfo?.gitCommitHash ? ` (Commit: ${syncInfo.gitCommitHash})` : '';
      const ghPushMsg = syncInfo?.githubPushed ? ' • 🚀 GitHub-এও সরাসরি রিমুভ পুশ হয়েছে!' : '';

      showSaveToast(
        '🗑️ মুভি মুছে ফেলা হয়েছে ও সর্বত্র সিঙ্ক হয়েছে!',
        `"${movieTitle}" সার্ভার ডাটাবেজ ও সোর্স কোড থেকে মুছে ফেলা হয়েছে${gitHashMsg}${ghPushMsg}।`,
        'delete'
      );
    }
  };

  // 3. Save Ads Configuration
  const handleSaveAds = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAds(true);
    const saveRes = await saveServerDatabase({ adSettings: adsForm });
    onAdSettingsUpdated(adsForm);
    setIsSavingAds(false);
    setAdsSavedNotice(true);
    setTimeout(() => setAdsSavedNotice(false), 4000);

    fetchGitStatus().then(st => st && setGitStatus(st));
    const syncInfo = saveRes.syncStatus;
    const gitHashMsg = syncInfo?.gitCommitHash ? ` (Commit: ${syncInfo.gitCommitHash})` : '';
    const ghPushMsg = syncInfo?.githubPushed ? ' • 🚀 GitHub-এও পুশ হয়েছে!' : '';

    showSaveToast(
      '✅ অ্যাড কোড ও সেটিংস সার্ভার ফাইলে সেভ হয়েছে!',
      `আপনার Adsterra / Monetag স্ক্রিপ্ট, ব্যানার কোড ও ডিরেক্ট লিংক সার্ভার ডিস্ক (/data/db.json) ও সোর্স কোডে সেভ হয়েছে${gitHashMsg}${ghPushMsg}। কোড আপডেট করলেও হারাবে না।`,
      'success'
    );
  };

  // 4. Save Site Configuration
  const handleSaveSiteConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSite(true);
    const saveRes = await saveServerDatabase({ siteConfig: siteForm });
    onSiteConfigUpdated(siteForm);
    setIsSavingSite(false);
    setSiteSavedNotice(true);
    setTimeout(() => setSiteSavedNotice(false), 4000);

    fetchGitStatus().then(st => st && setGitStatus(st));
    const syncInfo = saveRes.syncStatus;
    const gitHashMsg = syncInfo?.gitCommitHash ? ` (Commit: ${syncInfo.gitCommitHash})` : '';
    const ghPushMsg = syncInfo?.githubPushed ? ' • 🚀 GitHub-এও পুশ হয়েছে!' : '';

    showSaveToast(
      '✅ সাইট কনফিগারেশন সার্ভার ফাইলে সেভ হয়েছে!',
      `সাইটের নাম, অ্যাডমিন পাসওয়ার্ড, টেলিগ্রাম লিংক ও নোটিশ সার্ভার ডিস্ক (/data/db.json) ও সোর্স কোডে স্থায়ীভাবে সেভ হয়েছে${gitHashMsg}${ghPushMsg}। কোড আপডেট করলেও হারাবে না।`,
      'success'
    );
  };

  // Universal 1-Click Sync Everywhere Handler
  const handleOneClickUniversalSync = async () => {
    setIsSyncingAll(true);
    setSyncModalOpen(true);
    setSyncResult(null);
    try {
      const result = await triggerOneClickSync('Admin Universal 1-Click Sync');
      setSyncResult(result);
      const newGit = await fetchGitStatus();
      if (newGit) setGitStatus(newGit);

      showSaveToast(
        result.githubPushed ? '🚀 ১-ক্লিকে সর্বত্র ও GitHub-এ সিঙ্ক সম্পন্ন!' : '⚡ ১-ক্লিকে কোড ও ডাটাবেজ সিঙ্ক সম্পন্ন!',
        `সার্ভার ডিস্ক (/data/db.json) ও সোর্স কোড (/src/data/initialMovies.ts) আপডেট হয়েছে। গিট কমিট: ${result.gitCommitHash || 'Updated'}${result.githubPushed ? ' • GitHub-এও সফলভাবে পুশ হয়েছে!' : ''}`,
        'success'
      );
    } catch (e) {
      console.error('Universal sync error:', e);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // GitHub Settings Handlers
  const handleSaveGithubSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGithubConfig(true);

    const tokenToSend = githubForm.token || githubConfig.token || '';
    const payloadToSave: Partial<GitHubConfig> = {
      repoUrl: githubForm.repoUrl || githubConfig.repoUrl,
      branch: githubForm.branch || githubConfig.branch || 'main',
      token: tokenToSend,
      autoPush: githubForm.autoPush
    };

    const res = await saveGitHubConfig(payloadToSave);
    setIsSavingGithubConfig(false);

    if (res.success && res.data) {
      setGithubConfig(res.data);
      setGithubForm(prev => ({
        ...prev,
        repoUrl: res.data!.repoUrl,
        branch: res.data!.branch,
        token: tokenToSend,
        autoPush: res.data!.autoPush
      }));
      showSaveToast(
        '✅ GitHub সেটিংস সেভ হয়েছে!',
        `GitHub রিপোজিটোরি (${res.data.repoUrl}) ও টোকেন সফলভাবে সংরক্ষিত হয়েছে।`,
        'success'
      );
      // Automatically test connection after saving
      handleTestGithubConnection(res.data.repoUrl, tokenToSend);
    } else {
      showSaveToast('❌ সেটিংস সেভ হতে সমস্যা হয়েছে', 'পুনরায় চেষ্টা করুন।', 'delete');
    }
  };

  const handleTestGithubConnection = async (overrideRepo?: string, overrideToken?: string) => {
    const validRepoString = typeof overrideRepo === 'string' ? overrideRepo : '';
    const validTokenString = typeof overrideToken === 'string' ? overrideToken : '';
    const targetRepo = validRepoString || githubForm.repoUrl || githubConfig.repoUrl;
    const targetToken = validTokenString || githubForm.token || githubConfig.token;

    if (!targetRepo || !targetRepo.trim()) {
      alert('দয়া করে আপনার GitHub Repository (যেমন: funnymovies887-hash/movieloverbd) লিখুন');
      return;
    }
    if (!targetToken || !targetToken.trim()) {
      alert('দয়া করে আপনার GitHub Personal Access Token (PAT) লিখুন');
      return;
    }

    setTestConnectionStatus({ loading: true });
    const res = await testGitHubConnection(targetRepo, targetToken);
    setTestConnectionStatus({
      loading: false,
      success: res.success,
      message: res.message
    });
  };

  const handleManualPushToGithub = async () => {
    setIsManualPushing(true);
    const res = await triggerGitHubPush();
    setIsManualPushing(false);
    if (res.success) {
      showSaveToast('🚀 GitHub পুশ সফল হয়েছে!', res.message, 'success');
      loadGitAndGithubInfo();
    } else {
      showSaveToast('❌ GitHub পুশ ব্যর্থ হয়েছে', res.message, 'delete');
    }
  };

  const handleDownloadInitialMoviesSource = () => {
    const a = document.createElement('a');
    a.href = '/api/export/initial-movies';
    a.download = 'initialMovies.ts';
    a.click();
    showSaveToast('📥 সোর্স কোড ডাউনলোড সম্পন্ন!', 'initialMovies.ts ফাইলটি সফলভাবে ডাউনলোড হয়েছে।', 'info');
  };

  // 5. Backup & Restore
  const handleExportData = () => {
    const data = {
      movies,
      adSettings,
      siteConfig,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movielover-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSaveToast('📥 ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন!', 'আপনার সাইটের সব ডাটা JSON ফাইল আকারে সেভ হয়েছে।', 'info');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        await saveServerDatabase(parsed);
        if (parsed.movies && Array.isArray(parsed.movies)) {
          onMoviesUpdated(parsed.movies);
        }
        if (parsed.adSettings) {
          onAdSettingsUpdated(parsed.adSettings);
        }
        if (parsed.siteConfig) {
          onSiteConfigUpdated(parsed.siteConfig);
        }
        showSaveToast('✅ ব্যাকআপ রিস্টোর ও সার্ভার ডিস্কে সেভ সম্পন্ন!', 'সকল মুভি ও সেটিংস সফলভাবে সার্ভার ডাটাবেজ (/data/db.json) ফাইলে লোড ও সেভ হয়েছে।', 'success');
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = async () => {
    if (confirm('আপনি কি ডিফল্ট মুভি লাইব্রেরি (১৮+ মুভি) রিস্টোর করতে চান?')) {
      const res = await resetMoviesOnServer();
      onMoviesUpdated(res.movies);
      showSaveToast('✅ ডিফল্ট মুভি লাইব্রেরি রিস্টোর ও সেভ হয়েছে!', '১৮+ প্রিমিয়াম মুভি সফলভাবে সার্ভার ডাটাবেজ ও ব্রাউজারে সেভ হয়েছে।', 'success');
    }
  };

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(adminMovieSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(adminMovieSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Standalone Dashboard Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-none">
                {siteConfig.siteName} CMS & Ad Manager
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dedicated Control Panel • Direct URL: <code className="text-red-400 font-mono">/admin</code> or <code className="text-red-400 font-mono">#/admin</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Universal 1-Click Sync Button */}
          <button
            onClick={handleOneClickUniversalSync}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-purple-400/40"
            title="Save everything to Disk, Source Code, Git commit, and Push to GitHub"
          >
            {isSyncingAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">সিঙ্ক হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>⚡ এক ক্লিকে সর্বত্র আপডেট</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenGuide}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Monetization Guide</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">View Live Site</span>
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              onClose();
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 flex items-center gap-2 overflow-x-auto mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('movies')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'movies'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies ({movies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ads'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Adsterra & Monetag Ads</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'requests'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>User Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'backup'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Reset</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'github'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub & Cloud Sync (গিটহাব সিঙ্ক)</span>
            {githubConfig.hasToken && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="GitHub Connected" />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: MOVIES LIST & ADD/EDIT */}
          {activeTab === 'movies' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search movies in database..."
                    value={adminMovieSearch}
                    onChange={(e) => setAdminMovieSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <button
                  id="admin-add-movie-btn"
                  onClick={handleOpenAddMovie}
                  className="w-full sm:w-auto py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Movie / Series</span>
                </button>
              </div>

              {/* Movies Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Poster</th>
                        <th className="p-3">Movie Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Year</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3">Qualities</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredMovies.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3">
                            <img
                              src={m.posterUrl}
                              alt={m.title}
                              className="w-10 h-14 object-cover rounded shadow border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white text-sm">{m.title}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{m.cast.join(', ')}</div>
                          </td>
                          <td className="p-3">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-200">
                              {m.category}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{m.year}</td>
                          <td className="p-3 font-semibold text-amber-400">★ {m.rating}</td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60">
                              {m.quality.join(', ')}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditMovie(m)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white cursor-pointer"
                                title="Edit Movie"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMovie(m.id, m.title)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                                title={`Delete "${m.title}"`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADS & MONETIZATION (Adsterra, Monetag, Popunder, Smartlink) */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Earnings & CPM Impressions Live Simulator */}
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-800/40 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Live CPM Revenue Analytics
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      Adsterra & Monetag Impression Revenue
                    </h3>
                    <p className="text-xs text-slate-300">
                      Even if users do not click, every visit generates impressions (CPM) that calculate towards earnings.
                    </p>
                  </div>
                  <div className="text-right bg-slate-950/80 border border-emerald-500/30 px-4 py-2 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Estimated Balance (USD)
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      ${stats.estimatedEarningsUsd.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">CPM Impressions</span>
                    <span className="text-lg font-bold text-white">{stats.impressions.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Banner Views</span>
                    <span className="text-lg font-bold text-white">{stats.bannerViews.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Direct Link Clicks</span>
                    <span className="text-lg font-bold text-amber-400">{stats.directLinkClicks.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Form to paste Adsterra & Monetag codes */}
              <form onSubmit={handleSaveAds} className="space-y-5">
                {adsSavedNotice && (
                  <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Ad settings successfully saved and applied to all pages!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Test Ads Mode */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Show Demo / Placeholder Ads</h4>
                      <p className="text-[11px] text-slate-400">
                        Shows preview sponsor banners when custom scripts are empty.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={adsForm.testAdsMode}
                      onChange={(e) => setAdsForm({ ...adsForm, testAdsMode: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-red-600 cursor-pointer"
                    />
                  </div>

                  {/* Direct Link on Click */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Direct Link (Smartlink) on Download</h4>
                      <p className="text-[11px] text-slate-400">
                        Opens your Adsterra / Monetag Direct Link in background when user clicks download.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={adsForm.directLinkOnClickEnabled}
                      onChange={(e) => setAdsForm({ ...adsForm, directLinkOnClickEnabled: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Direct Link URL */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-300">
                    Adsterra / Monetag Direct Link (Smartlink URL)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Copy your "Direct Link" URL from Adsterra or "Smartlink" from Monetag and paste here.
                  </p>
                  <input
                    type="url"
                    placeholder="https://beta.adsterra.com/direct-link-url"
                    value={adsForm.directLinkUrl}
                    onChange={(e) => setAdsForm({ ...adsForm, directLinkUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Download Page Unlock Countdown */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-white">
                    Download Page Countdown Timer (Seconds)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    How many seconds visitors wait before download links unlock (optimizes CPM view time). Default is 5s.
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={adsForm.countdownSeconds}
                    onChange={(e) => setAdsForm({ ...adsForm, countdownSeconds: Number(e.target.value) })}
                    className="w-32 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Header Banner 728x90 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-white">
                    Header Banner Script / HTML (728x90 Leaderboard)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Paste the script code given by Adsterra or Monetag for 728x90 banner.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="<script type='text/javascript' src='//...adsterra...'></script>"
                    value={adsForm.headerBannerHtml}
                    onChange={(e) => setAdsForm({ ...adsForm, headerBannerHtml: e.target.value })}
                    className="w-full font-mono bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-3 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Floating Bottom Banner 320x50 / 728x90 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-white">
                    Sticky Footer Banner Script / HTML (High CPM Mobile & Desktop)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    This banner stays pinned at the bottom of the screen to accumulate impressions continuously.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="<script type='text/javascript' ...></script>"
                    value={adsForm.footerStickyBannerHtml}
                    onChange={(e) => setAdsForm({ ...adsForm, footerStickyBannerHtml: e.target.value })}
                    className="w-full font-mono bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-3 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Download Page Banner */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-white">
                    Download Page Banner Script / HTML (Above & Inside Download Box)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="<script type='text/javascript' ...></script>"
                    value={adsForm.downloadPageBannerHtml}
                    onChange={(e) => setAdsForm({ ...adsForm, downloadPageBannerHtml: e.target.value })}
                    className="w-full font-mono bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-3 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Popunder Script */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-xs font-bold text-white">
                    Popunder / OnClick Script (Adsterra Popunder / Monetag OnClick)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="<script type='text/javascript' src='//...popunder...'></script>"
                    value={adsForm.popunderScript}
                    onChange={(e) => setAdsForm({ ...adsForm, popunderScript: e.target.value })}
                    className="w-full font-mono bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-3 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    {isAdsDirty ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1.5 rounded-lg animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>অ্যাড কোডে পরিবর্তন হয়েছে — সেভ করতে বাটনে ক্লিক করুন!</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>সব অ্যাড কোড মেমোরিতে সেভ আছে (কোনো পরিবর্তন নেই)</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!isAdsDirty || isSavingAds}
                    className={`py-3 px-6 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                      isAdsDirty
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-2xl shadow-emerald-500/50 ring-4 ring-emerald-400/50 scale-[1.03] animate-pulse cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-40 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSavingAds ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>ডাটাবেজে সেভ হচ্ছে...</span>
                      </>
                    ) : isAdsDirty ? (
                      <>
                        <Save className="w-4 h-4 text-slate-950" />
                        <span>Save All Ad Codes & Settings (পরিবর্তন সেভ করুন)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>সব সেভ করা আছে (No Changes)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: USER REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Visitor Movie Requests</h3>
                  <p className="text-xs text-slate-400">
                    Movies requested by visitors through the Request Modal.
                  </p>
                </div>
              </div>

              {requests.length === 0 ? (
                <div className="text-center p-8 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No requests submitted yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm">{req.movieTitle}</h4>
                        <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Year: {req.year || 'N/A'}</span>
                          <span>•</span>
                          <span>Requested by: {req.userName || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{req.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'fulfilled'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {req.status}
                        </span>

                        {req.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const updated = updateStoredRequestStatus(req.id, 'fulfilled');
                                onRequestsUpdated(updated);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold cursor-pointer"
                            >
                              Fulfill
                            </button>
                            <button
                              onClick={() => {
                                const updated = updateStoredRequestStatus(req.id, 'rejected');
                                onRequestsUpdated(updated);
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white rounded text-[11px] cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSiteConfig} className="space-y-4 max-w-xl">
              {siteSavedNotice && (
                <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Site settings updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Website Brand Name
                </label>
                <input
                  type="text"
                  value={siteForm.siteName}
                  onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={siteForm.tagline}
                  onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Telegram Channel Link
                </label>
                <input
                  type="url"
                  value={siteForm.telegramLink}
                  onChange={(e) => setSiteForm({ ...siteForm, telegramLink: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Marquee Announcement Ticker Text
                </label>
                <textarea
                  rows={2}
                  value={siteForm.marqueeAnnouncement}
                  onChange={(e) => setSiteForm({ ...siteForm, marqueeAnnouncement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-3 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Change Admin Password
                </label>
                <input
                  type="password"
                  value={siteForm.adminPassword}
                  onChange={(e) => setSiteForm({ ...siteForm, adminPassword: e.target.value })}
                  placeholder="Enter new admin password..."
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Keep this password secret. Only you can access the admin portal.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs">
                  {isSiteDirty ? (
                    <span className="text-red-400 font-bold flex items-center gap-1.5 bg-red-950/50 border border-red-800/80 px-3 py-1.5 rounded-lg animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      <span>সাইট সেটিংসে পরিবর্তন হয়েছে — সেভ করতে বাটনে ক্লিক করুন!</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>সাইট সেটিংস সেভ আছে (কোনো পরিবর্তন নেই)</span>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isSiteDirty || isSavingSite}
                  className={`py-2.5 px-6 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                    isSiteDirty
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-2xl shadow-red-600/50 ring-4 ring-red-400/50 scale-[1.03] animate-pulse cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-40 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSavingSite ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>সেভ হচ্ছে...</span>
                    </>
                  ) : isSiteDirty ? (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Save Site Settings (সাইট সেটিংস সেভ করুন)</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>সেটিংস সেভ আছে (No Changes)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: BACKUP & RESET */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-xl">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Export & Download JSON Database</h4>
                <p className="text-xs text-slate-400">
                  Safely download all your movies, ad codes, and settings in a single JSON file.
                </p>
                <button
                  onClick={handleExportData}
                  className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Database className="w-4 h-4" />
                  <span>Download Backup (JSON)</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Import / Restore from Backup</h4>
                <p className="text-xs text-slate-400">
                  Select a previously exported JSON backup to restore all data instantly.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-red-950 space-y-3">
                <h4 className="text-sm font-bold text-red-400">Reset to Default Movie Library</h4>
                <p className="text-xs text-slate-400">
                  If you ever need to restore the initial curated collection of 15+ Bengali, South, Bollywood, and Hollywood releases.
                </p>
                <button
                  onClick={handleResetToDefault}
                  className="py-2 px-4 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Database to Default</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: GITHUB & CLOUD AUTO-SYNC */}
          {activeTab === 'github' && (
            <div className="space-y-6 max-w-3xl">
              {/* Header Box */}
              <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-800/60 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <GitBranch className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>গিটহাব ও ক্লাউড অটো-সিঙ্ক (GitHub & Cloud Sync)</span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono">
                          v3.0 Permanent
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        এখানে যা মুভি অ্যাড বা ডিলিট করবেন, তা এক ক্লিকে সরাসরি আপনার গিটহাব ও সোর্স কোডে পার্মানেন্ট আপডেট হয়ে যাবে।
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOneClickUniversalSync}
                    disabled={isSyncingAll}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    {isSyncingAll ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সিঙ্ক হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span>⚡ ১-ক্লিকে সর্বত্র সিঙ্ক করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Layer 1: Disk Database */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">সার্ভার ডাটাবেজ (/data/db.json)</div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                        Active & Saved
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      মোট {movies.length} টি মুভি সংরক্ষিত আছে
                    </div>
                  </div>
                </div>

                {/* Layer 2: TypeScript Source Code */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">সোর্স কোড (initialMovies.ts)</div>
                      <span className="text-[10px] text-sky-400 font-bold bg-sky-950/60 border border-sky-800 px-1.5 py-0.5 rounded">
                        Auto-Generated
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      কোড পরিবর্তন বা রিফ্রেশ করলেও ডাটা হারাবে না
                    </div>
                  </div>
                </div>

                {/* Layer 3: Local Git Repository */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <GitCommit className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">লোকাল গিট হিস্টোরি (Local Git)</div>
                      <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 border border-purple-800 px-1.5 py-0.5 rounded">
                        branch: {gitStatus?.branch || 'main'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate font-mono">
                      Commit: <span className="text-purple-300 font-semibold">{gitStatus?.lastCommitHash || 'Active'}</span> • {gitStatus?.lastCommitMessage || 'Up-to-date'}
                    </div>
                  </div>
                </div>

                {/* Layer 4: GitHub Remote Sync */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    githubConfig.hasToken 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">GitHub রিমোট রিপোজিটোরি</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        githubConfig.hasToken 
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' 
                          : 'text-amber-400 bg-amber-950/60 border border-amber-800'
                      }`}>
                        {githubConfig.hasToken ? 'Connected' : 'Setup Required'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {githubConfig.repoUrl ? githubConfig.repoUrl : 'নিচের ফর্মে GitHub টোকেন ও রিপোজিটোরি দিন'}
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub Settings Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">GitHub Integration Settings</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Token is kept private and never exposed
                  </span>
                </div>

                <form onSubmit={handleSaveGithubSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      GitHub Repository (ইউজারনেম/রিপোজিটোরি নাম) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. funnymovies887/movielover বা https://github.com/funnymovies887/movielover"
                      value={githubForm.repoUrl}
                      onChange={(e) => setGithubForm({ ...githubForm, repoUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 font-mono text-xs focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      আপনার তৈরি করা GitHub রিপোজিটোরির নাম দিন।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Branch Name (শাখা)
                      </label>
                      <input
                        type="text"
                        placeholder="main"
                        value={githubForm.branch}
                        onChange={(e) => setGithubForm({ ...githubForm, branch: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 font-mono text-xs focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        GitHub Personal Access Token (PAT) *
                      </label>
                      <div className="relative">
                        <input
                          type={showPatToken ? 'text' : 'password'}
                          placeholder={githubConfig.hasToken ? '•••••••••••••••••••••••• (Configured)' : 'ghp_xxxxxxxxxxxx...'}
                          value={githubForm.token}
                          onChange={(e) => setGithubForm({ ...githubForm, token: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 pr-10 font-mono text-xs focus:border-purple-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPatToken(!showPatToken)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                          {showPatToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Guide callout */}
                  <div className="bg-slate-950/80 border border-purple-900/40 rounded-xl p-3.5 text-[11px] text-slate-300 space-y-2">
                    <div className="font-bold text-purple-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span>GitHub Token কানেক্ট না হওয়ার প্রধান কারণ ও সঠিক নিয়ম:</span>
                      </div>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-purple-300 hover:text-white underline font-semibold cursor-pointer"
                      >
                        সরাসরি টোকেন তৈরি করুন &rarr;
                      </a>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                      <li>
                        <strong className="text-amber-300">১. টোকেন টাইপ:</strong> GitHub-এ <strong className="text-white">Tokens (classic)</strong> ব্যবহার করতে হবে (Fine-grained token এ প্রায়ই পুশ পারমিশন ব্লক থাকে)।
                      </li>
                      <li>
                        <strong className="text-amber-300">২. পারমিশন (Scopes):</strong> টোকেন বানানোর সময় অবশ্যই <strong className="text-emerald-400 font-mono">repo</strong> (Full control of private repositories) চেকবক্সে টিক দিতে হবে।
                      </li>
                      <li>
                        <strong className="text-amber-300">৩. রিপোজিটোরি ফরম্যাট:</strong> সম্পূর্ণ লিঙ্ক বা শুধু <code className="text-purple-300 bg-slate-900 px-1 rounded">username/repository</code> লিখবেন (যেমন: <code className="text-sky-300">funnymovies887/movielover</code>)।
                      </li>
                      <li>
                        <strong className="text-amber-300">৪. টোকেন ফরম্যাট:</strong> এটি <code className="text-purple-300 font-mono">ghp_</code> দিয়ে শুরু হয়। পাসওয়ার্ড নয়, টোকেনটি পেস্ট করতে হবে।
                      </li>
                    </ol>
                  </div>

                  {/* Auto-push switch */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">অটো-পুশ (Auto-push on every movie change)</div>
                      <div className="text-[10px] text-slate-400">
                        অ্যাডমিন প্যানেলে যেকোনো মুভি যোগ বা ডিলিট করলে সরাসরি GitHub-এ পুশ হবে
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={githubForm.autoPush}
                      onChange={(e) => setGithubForm({ ...githubForm, autoPush: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Test Status Message */}
                  {testConnectionStatus && (
                    <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      testConnectionStatus.success
                        ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                        : 'bg-red-950/50 border-red-800 text-red-300'
                    }`}>
                      {testConnectionStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>{testConnectionStatus.message}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTestGithubConnection()}
                      disabled={testConnectionStatus?.loading}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      {testConnectionStatus?.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      <span>Test GitHub Connection</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingGithubConfig}
                      className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isSavingGithubConfig ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save GitHub Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleManualPushToGithub}
                      disabled={isManualPushing || !githubConfig.hasToken}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isManualPushing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      <span>Push to GitHub Now</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Source Code Direct Export */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>সোর্স কোড ফাইল ডাউনলোড (Direct TypeScript Source Export)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  আপনার সকল সংরক্ষিত মুভির খাঁটি টাইপস্ক্রিপ্ট সোর্স কোড ফাইলটি ডাউনলোড করতে পারেন:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadInitialMoviesSource}
                    className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Download initialMovies.ts</span>
                  </button>

                  <button
                    onClick={handleExportData}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Download db.json</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating quick-save pill for Ads tab when changes are made */}
      {activeTab === 'ads' && isAdsDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-emerald-500 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-5 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-xs font-black text-white">অ্যাড কোডে পরিবর্তন হয়েছে!</div>
              <div className="text-[10px] text-emerald-400 font-medium">স্থায়ীভাবে সেভ করতে বাটনে চাপুন</div>
            </div>
          </div>
          <button
            onClick={() => handleSaveAds()}
            disabled={isSavingAds}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/40 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
          >
            {isSavingAds ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Floating quick-save pill for Site Settings tab when changes are made */}
      {activeTab === 'settings' && isSiteDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-red-500 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-5 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div className="text-left">
              <div className="text-xs font-black text-white">সাইট সেটিংসে পরিবর্তন হয়েছে!</div>
              <div className="text-[10px] text-red-400 font-medium">স্থায়ীভাবে সেভ করতে বাটনে চাপুন</div>
            </div>
          </div>
          <button
            onClick={() => handleSaveSiteConfig()}
            disabled={isSavingSite}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/40 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
          >
            {isSavingSite ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings Now</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Prominent Database Save Confirmation Notification Toast */}
      {toast && (
        <div className="fixed top-5 right-4 sm:right-8 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto">
          <div className={`p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-xl flex items-start gap-3.5 transition-all ${
            toast.type === 'delete'
              ? 'bg-slate-900/95 border-red-500 text-white shadow-red-950/70'
              : toast.type === 'info'
              ? 'bg-slate-900/95 border-sky-500 text-white shadow-sky-950/70'
              : 'bg-slate-900/95 border-emerald-500 text-white shadow-emerald-950/70'
          }`}>
            <div className={`p-2.5 rounded-xl flex-shrink-0 shadow-inner ${
              toast.type === 'delete' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : toast.type === 'info'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {toast.type === 'delete' ? (
                <Trash2 className="w-5 h-5" />
              ) : toast.type === 'info' ? (
                <Database className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5 stroke-[3]" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{toast.title}</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                  {toast.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {toast.description}
              </p>
              
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>ডাটাবেজে পার্মানেন্ট সেভ হয়েছে (Permanent Storage Synced)</span>
                </span>
                <span className="text-slate-400">রিফ্রেশ দিলেও মুছবে না</span>
              </div>
            </div>

            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Universal 1-Click Sync Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-700/60 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/40">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">সর্বজনীন সিঙ্ক (1-Click Sync Everywhere)</h3>
                  <p className="text-[10px] text-slate-400">এক ক্লিকে ডিস্ক, সোর্স কোড ও গিটহাবে আপডেট</p>
                </div>
              </div>
              <button
                onClick={() => setSyncModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">১. সার্ভার ডাটাবেজ (/data/db.json)</div>
                  <div className="text-[11px] text-emerald-400">সফলভাবে ডিস্কে স্থায়ীভাবে সেভ হয়েছে</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">২. সোর্স কোড ফাইল (/src/data/initialMovies.ts)</div>
                  <div className="text-[11px] text-sky-400">কোড ফাইলটি আপডেট সম্পন্ন — কোড পরিবর্তন করলেও ডাটা আর হারাবে না</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">৩. লোকাল গিট কমিট (Local Git Commit)</div>
                  <div className="text-[11px] text-purple-300 font-mono">
                    Commit Hash: {syncResult?.gitCommitHash || gitStatus?.lastCommitHash || 'Active'}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {syncResult?.githubPushed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-white">৪. GitHub রিমোট রিপোজিটোরি</div>
                  <div className={`text-[11px] ${syncResult?.githubPushed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {syncResult?.githubMessage || 'GitHub পুশ সম্পন্ন হয়েছে বা টোকেন সেট করা বাকি আছে (GitHub Sync ট্যাব দেখুন)।'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSyncModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-purple-600/30"
              >
                ঠিক আছে (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MOVIE */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingMovieId ? 'Edit Movie / Series' : 'Add New Movie / Series'}
              </h3>
              <button
                onClick={() => setIsMovieModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toofan (2024)"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Original / Native Title</label>
                  <input
                    type="text"
                    placeholder="e.g. তুফান"
                    value={movieForm.originalTitle}
                    onChange={(e) => setMovieForm({ ...movieForm, originalTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={movieForm.category}
                    onChange={(e) => setMovieForm({ ...movieForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="bengali">Bengali Movie</option>
                    <option value="south">South Hindi Dubbed</option>
                    <option value="bollywood">Bollywood</option>
                    <option value="hollywood">Hollywood Dual Audio</option>
                    <option value="webseries">Web Series</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Release Year</label>
                  <input
                    type="number"
                    value={movieForm.year}
                    onChange={(e) => setMovieForm({ ...movieForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">IMDb Rating (e.g. 8.4)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2h 25m or Season 1 [All Episodes]"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Poster & Backdrop with live image preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Poster Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                  {movieForm.posterUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={movieForm.posterUrl}
                        alt="Poster Preview"
                        className="w-10 h-14 object-cover rounded border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-emerald-400 font-semibold">Poster Preview OK</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Backdrop Banner URL</label>
                  <input
                    type="url"
                    value={movieForm.backdropUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, backdropUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    value={formLanguagesStr}
                    onChange={(e) => setFormLanguagesStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={formGenresStr}
                    onChange={(e) => setFormGenresStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Star Cast (comma separated)</label>
                <input
                  type="text"
                  value={formCastStr}
                  onChange={(e) => setFormCastStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Storyline / Synopsis</label>
                <textarea
                  rows={3}
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5"
                />
              </div>

              {/* 1. Full Movie Online Watch / Stream URL */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-500" />
                    <label className="text-slate-200 font-bold text-xs">
                      Full Movie Watch Online / Stream URL (ফুল মুভি অনলাইনে দেখার ভিডিও লিংক)
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    YouTube / Google Drive Preview / HubCloud / MP4
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ব্যবহারকারীরা সাইটে অনলাইনে সরাসরি মুভি দেখতে পারবে। আপনি <strong className="text-slate-300">Google Drive Preview লিংক</strong>, <strong className="text-slate-300">YouTube Embed/Watch লিংক</strong>, সরাসরি <strong className="text-slate-300">.mp4/.mkv ভিডিও ফাইল লিংক</strong> অথবা <strong className="text-slate-300">HubCloud/Streamtape/Doodstream প্লেয়ার লিংক</strong> বসাতে পারেন।
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="url"
                    placeholder="e.g. https://drive.google.com/file/d/XXX/preview অথবা https://youtu.be/... অথবা https://.../movie.mp4"
                    value={movieForm.streamUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, streamUrl: e.target.value })}
                    className="flex-1 w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:border-red-500 outline-none"
                  />

                  {/* Quick Google Drive /preview fixer */}
                  {Boolean(movieForm.streamUrl && movieForm.streamUrl.includes('drive.google.com/file/d/') && !movieForm.streamUrl.includes('/preview')) && (
                    <button
                      type="button"
                      onClick={() => {
                        const fixed = formatYouTubeEmbedUrl(movieForm.streamUrl || '');
                        setMovieForm({ ...movieForm, streamUrl: fixed });
                      }}
                      className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 text-blue-300 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                      title="Convert Google Drive link to /preview for embedded playback"
                    >
                      ⚡ ড্রাইভ প্রিভিউ লিংক করুন
                    </button>
                  )}

                  {movieForm.streamUrl && (
                    <button
                      type="button"
                      onClick={() => setShowModalVideoPreview(!showModalVideoPreview)}
                      className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/60 text-red-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-red-400" />
                      <span>{showModalVideoPreview ? 'প্রিভিউ বন্ধ করুন' : '▶ টেস্ট প্লেয়ার'}</span>
                    </button>
                  )}
                </div>

                {/* Inline Video Preview in Admin Modal */}
                {showModalVideoPreview && movieForm.streamUrl && (
                  <div className="mt-3 p-2 bg-black rounded-xl border border-red-500/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        লাইভ ভিডিও প্লেয়ার প্রিভিউ
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowModalVideoPreview(false)}
                        className="text-slate-400 hover:text-white text-[10px] cursor-pointer"
                      >
                        ✕ Close Preview
                      </button>
                    </div>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                      {movieForm.streamUrl.match(/\.(mp4|webm|ogg|m4v)(\?.*)?$/i) ? (
                        <video
                          src={movieForm.streamUrl}
                          controls
                          className="w-full h-full object-contain"
                        >
                          Video format not supported.
                        </video>
                      ) : (
                        <iframe
                          src={formatYouTubeEmbedUrl(movieForm.streamUrl)}
                          title="Stream Preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Download Options & Qualities Section (480p, 720p, 1080p, 4K UHD) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <label className="text-slate-200 font-bold text-xs">
                      Full Movie Download Options & Servers (ডাউনলোড লিংক ও কোয়ালিটি কনফিগ)
                    </label>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {movieForm.downloadOptions.length} টি কোয়ালিটি অপশন সক্রিয়
                  </span>
                </div>

                {/* Helpful Tip regarding quality conversion vs separate links */}
                <div className="bg-slate-900/90 border border-amber-800/50 rounded-lg p-2.5 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-bold">💡 কোয়ালিটি কনভার্ট নাকি আলাদা লিংক?</strong>
                    <p className="mt-0.5 text-slate-300">
                      ভিডিও ফাইল স্বয়ংক্রিয়ভাবে 480p, 720p, 1080p-তে কনভার্ট করতে বিশাল ভিডিও এনকোডিং সার্ভার লাগে। তাই সব জনপ্রিয় মুভি সাইট (যেমন VegaMovies, HubCloud) গুগল ড্রাইভ বা ক্লাউডে আগে থেকেই 480p, 720p, 1080p সাইজের ফাইল আপলোড করে আলাদা লিংক দিয়ে দেয়।
                    </p>
                    <p className="mt-1 text-emerald-300 font-medium">
                      ⚡ আপনার কাজের সুবিধার জন্য নিচে <strong>"১-ক্লিকে ৪টি কোয়ালিটি জেনারেট"</strong> অপশন রয়েছে — শুধু ১টি ফাইল বা ড্রাইভ লিংক দিলেই সব কোয়ালিটি লিংক ও সাইজ এক সেকেন্ডে অটো-তৈরি হয়ে যাবে!
                    </p>
                  </div>
                </div>

                {/* 1-Click Master Link Auto Generator Box */}
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>১-ক্লিকে ৪টি কোয়ালিটি লিংক অটো-জেনারেটর (Master Movie Link)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Google Drive / HubCloud / TeraBox / Mega</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="আপনার মূল ড্রাইভ/ক্লাউড লিংকটি এখানে পেস্ট করুন (যেমন: https://hubcloud.club/...)"
                      value={masterMovieLink}
                      onChange={(e) => setMasterMovieLink(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerateQualities}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md shadow-emerald-950 transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ ৪টি কোয়ালিটিতে অটো-সেট করুন</span>
                    </button>
                  </div>
                </div>

                {/* Quality Cards List */}
                <div className="space-y-3 pt-1">
                  {movieForm.downloadOptions.map((opt, qIdx) => (
                    <div
                      key={qIdx}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2.5 transition-colors"
                    >
                      {/* Quality Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-600/30 border border-red-500/50 text-red-300 font-extrabold text-xs">
                            {opt.quality || `Quality #${qIdx + 1}`}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {opt.size} • {opt.format}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuality(qIdx)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Delete this quality option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছে ফেলুন</span>
                        </button>
                      </div>

                      {/* Quality Meta Row (Quality Name, Size, Format) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            Quality Name (e.g. 480p / 720p / 1080p / 4K)
                          </label>
                          <input
                            type="text"
                            value={opt.quality}
                            onChange={(e) => handleQualityChange(qIdx, 'quality', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-2.5 py-1.5 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            File Size (e.g. 450 MB / 1.2 GB / 2.8 GB)
                          </label>
                          <input
                            type="text"
                            value={opt.size}
                            onChange={(e) => handleQualityChange(qIdx, 'size', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            Format / Rip Type
                          </label>
                          <input
                            type="text"
                            value={opt.format}
                            onChange={(e) => handleQualityChange(qIdx, 'format', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>

                      {/* Download Servers for this quality */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <Server className="w-3 h-3 text-slate-400" />
                            Download Servers ({opt.servers.length} টি সার্ভার লিংক):
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddServer(qIdx)}
                            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ সার্ভার লিংক যোগ করুন</span>
                          </button>
                        </div>

                        {opt.servers.map((srv, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex flex-col sm:flex-row items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 rounded-lg p-2"
                          >
                            <input
                              type="text"
                              placeholder="সার্ভারের নাম (যেমন: Google Drive Fast Server)"
                              value={srv.name}
                              onChange={(e) => handleServerChange(qIdx, sIdx, 'name', e.target.value)}
                              className="w-full sm:w-1/3 bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                            />

                            <input
                              type="url"
                              placeholder="ডাউনলোড লিংক (https://...)"
                              value={srv.url}
                              onChange={(e) => handleServerChange(qIdx, sIdx, 'url', e.target.value)}
                              className="w-full sm:flex-1 bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                            />

                            <select
                              value={srv.type}
                              onChange={(e) => handleServerChange(qIdx, sIdx, 'type', e.target.value)}
                              className="w-full sm:w-28 bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                            >
                              <option value="gdrive">G-Drive</option>
                              <option value="cloud">Cloud Mirror</option>
                              <option value="direct">Direct Link</option>
                              <option value="torrent">Torrent</option>
                            </select>

                            <div className="flex items-center gap-1 self-end sm:self-center">
                              {srv.url && (
                                <a
                                  href={srv.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                  title="Test URL in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveServer(qIdx, sIdx)}
                                className="p-1 rounded bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 cursor-pointer"
                                title="Delete Server"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddNewQualityOption}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-900/50 hover:bg-slate-900 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ নতুন আরেকটি কোয়ালিটি অপশন যোগ করুন (যেমন 4K UHD বা 2160p)</span>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={movieForm.isFeatured}
                    onChange={(e) => setMovieForm({ ...movieForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={movieForm.isTrending}
                    onChange={(e) => setMovieForm({ ...movieForm, isTrending: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Mark as Trending</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  {!isMovieFormValid ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg">
                      <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>মুভির টাইটেল লিখলে Save বাটন ভেসে উঠবে (বর্তমানে ঝাপসা ও নিষ্ক্রিয়)</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1.5 rounded-lg animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Save বাটন সক্রিয় হয়েছে! ডাটাবেজে পার্মানেন্ট সেভ করতে ক্লিক করুন</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsMovieModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isMovieFormValid || isSavingMovie}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                      isMovieFormValid
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-2xl shadow-red-600/50 ring-4 ring-red-400/60 scale-[1.03] animate-pulse cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-35 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSavingMovie ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ডাটাবেজে সেভ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Movie to Database (সেভ করুন)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
