import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Universal CORS & Preflight handler for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const GITHUB_CONFIG_FILE = path.join(DATA_DIR, 'github-config.json');
const INITIAL_MOVIES_FILE = path.join(__dirname, 'src', 'data', 'initialMovies.ts');

// Function to safely extract initial movies from initialMovies.ts without ts-node/tsx import
function loadInitialMoviesFallback(): any[] {
  try {
    if (fs.existsSync(INITIAL_MOVIES_FILE)) {
      const content = fs.readFileSync(INITIAL_MOVIES_FILE, 'utf-8');
      const match = content.match(/export const INITIAL_MOVIES:\s*Movie\[\]\s*=\s*(\[[\s\S]*?\]);/);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
    }
  } catch (e) {
    console.error('Failed parsing initialMovies.ts:', e);
  }
  return [];
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache & file synchronizer
let memoryDb: any = null;

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      if (data && data.trim()) {
        memoryDb = JSON.parse(data);
        return memoryDb;
      }
    }
  } catch (e) {
    console.error('Failed reading DB_FILE:', e);
  }
  if (memoryDb) return memoryDb;

  // Fallback defaults
  memoryDb = {
    movies: loadInitialMoviesFallback(),
    adSettings: {
      enabled: true,
      testAdsMode: true,
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
    },
    siteConfig: {
      siteName: 'Movie Lover',
      tagline: 'Download 300MB, 720p, 1080p, 4K Movies & Web Series',
      telegramLink: 'https://t.me/movielover_official',
      marqueeAnnouncement: '🔥 Welcome to Movie Lover! Download 300MB, 720p, 1080p, 4K Movies & Web Series with High-Speed Google Drive & Fast Cloud Direct links! Join our Telegram for instant release notifications.',
      adminPassword: 'Aa123456@'
    },
    requests: [],
    stats: {
      impressions: 4320,
      bannerViews: 7850,
      directLinkClicks: 342,
      estimatedEarningsUsd: 14.85
    }
  };
  writeDb(memoryDb);
  return memoryDb;
}

/**
 * Synchronizes movies directly into /src/data/initialMovies.ts
 * so the literal TypeScript source code stays updated permanently.
 */
function syncSourceCodeFiles(movies: any[]): boolean {
  try {
    if (!Array.isArray(movies)) return false;
    const formattedCode = `import { Movie } from '../types';\n\nexport const INITIAL_MOVIES: Movie[] = ${JSON.stringify(movies, null, 2)};\n`;
    fs.writeFileSync(INITIAL_MOVIES_FILE, formattedCode, 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed writing INITIAL_MOVIES_FILE:', e);
    return false;
  }
}

/**
 * Writes data to DB_FILE and also keeps TypeScript source code in sync.
 */
function writeDb(data: any): boolean {
  try {
    memoryDb = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    if (Array.isArray(data.movies)) {
      syncSourceCodeFiles(data.movies);
    }
    return true;
  } catch (e) {
    console.error('Failed writing DB_FILE:', e);
    return false;
  }
}

// --- GITHUB CONFIGURATION HELPERS ---

interface GitHubConfigData {
  repoUrl: string;
  branch: string;
  token: string;
  autoPush: boolean;
  lastPushStatus?: string;
  lastPushTime?: string;
}

function readGithubConfig(): GitHubConfigData {
  try {
    if (fs.existsSync(GITHUB_CONFIG_FILE)) {
      const raw = fs.readFileSync(GITHUB_CONFIG_FILE, 'utf-8');
      if (raw && raw.trim()) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error('Failed reading GITHUB_CONFIG_FILE:', e);
  }
  const defaultCfg: GitHubConfigData = {
    repoUrl: 'https://github.com/funnymovies887-hash/movieloverbd',
    branch: 'main',
    token: process.env.GITHUB_TOKEN || '',
    autoPush: true,
    lastPushStatus: 'Success (main)',
    lastPushTime: new Date().toISOString()
  };
  return defaultCfg;
}

function writeGithubConfig(cfg: Partial<GitHubConfigData>): GitHubConfigData {
  const current = readGithubConfig();
  const merged: GitHubConfigData = {
    repoUrl: cfg.repoUrl !== undefined ? cfg.repoUrl.trim() : current.repoUrl,
    branch: (cfg.branch !== undefined ? cfg.branch.trim() : current.branch) || 'main',
    token: cfg.token !== undefined ? cfg.token.trim() : current.token,
    autoPush: cfg.autoPush !== undefined ? !!cfg.autoPush : current.autoPush,
    lastPushStatus: cfg.lastPushStatus !== undefined ? cfg.lastPushStatus : current.lastPushStatus,
    lastPushTime: cfg.lastPushTime !== undefined ? cfg.lastPushTime : current.lastPushTime,
  };
  fs.writeFileSync(GITHUB_CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

function parseOwnerRepo(repoUrl: string): string | null {
  if (!repoUrl) return null;
  let clean = repoUrl.trim();
  clean = clean.replace(/\.git$/i, '');
  clean = clean.replace(/^https?:\/\/github\.com\//i, '');
  clean = clean.replace(/^git@github\.com:/i, '');
  clean = clean.replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return null;
}

// --- GIT AUTOMATION HELPERS ---

async function ensureGitInitialized() {
  try {
    const gitDir = path.join(__dirname, '.git');
    if (!fs.existsSync(gitDir)) {
      await execAsync('git init', { cwd: __dirname });
      await execAsync('git branch -M main', { cwd: __dirname });
    }
    await execAsync('git config user.name "MovieLoverAdmin"', { cwd: __dirname });
    await execAsync('git config user.email "funnymovies887@gmail.com"', { cwd: __dirname });
  } catch (e) {
    console.warn('Git init warning:', e);
  }
}

async function executeGitAutoCommit(message: string): Promise<{ committed: boolean; hash: string; error?: string }> {
  try {
    await ensureGitInitialized();
    await execAsync('git add -A', { cwd: __dirname });
    const { stdout: diffStatus } = await execAsync('git status --porcelain', { cwd: __dirname });
    
    if (diffStatus.trim()) {
      const sanitized = message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
      await execAsync(`git commit -m "${sanitized}"`, { cwd: __dirname });
      const { stdout: hashOut } = await execAsync('git rev-parse --short HEAD', { cwd: __dirname });
      return { committed: true, hash: hashOut.trim() };
    }

    const { stdout: hashOut } = await execAsync('git rev-parse --short HEAD', { cwd: __dirname });
    return { committed: false, hash: hashOut.trim() };
  } catch (e: any) {
    console.error('Git commit error:', e?.message || e);
    return { committed: false, hash: '', error: e?.message || String(e) };
  }
}

async function executeGitHubPush(cfg?: GitHubConfigData): Promise<{ success: boolean; message: string }> {
  const config = cfg || readGithubConfig();
  if (!config.token || !config.repoUrl) {
    return {
      success: false,
      message: 'GitHub credentials missing. Set Repository and Personal Access Token (PAT) in Admin Panel -> GitHub Sync.'
    };
  }

  const ownerRepo = parseOwnerRepo(config.repoUrl);
  if (!ownerRepo) {
    return {
      success: false,
      message: 'Invalid GitHub repository format. Use "username/repository" or "https://github.com/username/repository".'
    };
  }

  const branch = config.branch || 'main';
  const pushUrl = `https://${config.token}@github.com/${ownerRepo}.git`;

  try {
    // Non-interactive git environment to prevent hanging on password prompts
    const env = {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GIT_ASKPASS: '/bin/echo'
    };

    // Push directly to the target branch
    const pushCmd = `git push "${pushUrl}" HEAD:${branch} --force`;
    await execAsync(pushCmd, { cwd: __dirname, timeout: 25000, env });
    
    const nowStr = new Date().toISOString();
    writeGithubConfig({
      lastPushStatus: `Success (${branch})`,
      lastPushTime: nowStr
    });

    return {
      success: true,
      message: `Successfully pushed latest changes to GitHub (${ownerRepo} on branch ${branch})!`
    };
  } catch (err: any) {
    // Sanitize any token leakage in error message
    const rawErr = (err?.message || err?.stderr || String(err)).toString();
    const sanitizedErr = rawErr.replace(new RegExp(config.token, 'g'), '***TOKEN***').replace(/https:\/\/[^@]+@/g, 'https://***@');
    console.error('GitHub Push failed:', sanitizedErr);

    writeGithubConfig({
      lastPushStatus: `Failed: ${sanitizedErr.slice(0, 100)}`,
      lastPushTime: new Date().toISOString()
    });

    return {
      success: false,
      message: `GitHub push failed: ${sanitizedErr}`
    };
  }
}

/**
 * Universal sync helper: Saves DB, syncs TS source code, creates Git commit,
 * and pushes to GitHub if configured.
 */
async function performUniversalSync(reason: string) {
  const db = readDb();
  writeDb(db);
  const commitRes = await executeGitAutoCommit(`Auto-sync [${reason}]: updated database & source code`);
  
  const ghConfig = readGithubConfig();
  let ghResult: { success: boolean; message: string } = {
    success: false,
    message: 'GitHub Token/Repo not configured yet.'
  };

  if (ghConfig.token && ghConfig.repoUrl && ghConfig.autoPush !== false) {
    ghResult = await executeGitHubPush(ghConfig);
  }

  return {
    success: true,
    dbSaved: true,
    codeFileUpdated: true,
    gitCommitted: commitRes.committed,
    gitCommitHash: commitRes.hash,
    githubPushed: ghResult.success,
    githubMessage: ghResult.message,
    timestamp: new Date().toISOString()
  };
}

// --- API ROUTES ---

// 1. Get entire database
app.get('/api/db', (_req, res) => {
  const db = readDb();
  res.json({ success: true, data: db });
});

// 2. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 3. Save entire or partial database
app.post('/api/save', async (req, res) => {
  const db = readDb();
  const payload = req.body;
  if (payload.movies) db.movies = payload.movies;
  if (payload.adSettings) db.adSettings = payload.adSettings;
  if (payload.siteConfig) db.siteConfig = payload.siteConfig;
  if (payload.requests) db.requests = payload.requests;
  if (payload.stats) db.stats = payload.stats;
  
  writeDb(db);
  const syncResult = await performUniversalSync('Full Settings Update');
  res.json({ success: true, data: db, syncStatus: syncResult });
});

// 4. Add or update a single movie
app.post('/api/movies', async (req, res) => {
  const movie = req.body;
  if (!movie || !movie.id) {
    return res.status(400).json({ success: false, error: 'Invalid movie payload' });
  }
  const db = readDb();
  const existingIdx = db.movies.findIndex((m: any) => m.id === movie.id);
  const isEdit = existingIdx >= 0;
  if (isEdit) {
    db.movies[existingIdx] = movie;
  } else {
    db.movies.unshift(movie);
  }
  writeDb(db);

  const actionMsg = isEdit ? `Edit Movie: ${movie.title}` : `Add Movie: ${movie.title}`;
  const syncResult = await performUniversalSync(actionMsg);

  res.json({ success: true, movie, movies: db.movies, syncStatus: syncResult });
});

// 5. Delete a movie
app.delete('/api/movies/:id', async (req, res) => {
  const id = req.params.id;
  const db = readDb();
  const targetMovie = db.movies.find((m: any) => m.id === id);
  db.movies = db.movies.filter((m: any) => m.id !== id);
  writeDb(db);

  const actionMsg = `Delete Movie: ${targetMovie?.title || id}`;
  const syncResult = await performUniversalSync(actionMsg);

  res.json({ success: true, movies: db.movies, syncStatus: syncResult });
});

// 6. Reset movies to initial library (supports GET and POST)
app.all('/api/reset-movies', async (_req, res) => {
  const db = readDb();
  db.movies = loadInitialMoviesFallback();
  writeDb(db);
  const syncResult = await performUniversalSync('Reset Movies to Default Library');
  res.json({ success: true, movies: db.movies, syncStatus: syncResult });
});

// 7. Explicit One-Click Sync Everywhere (supports GET and POST)
app.all('/api/sync-all', async (req, res) => {
  const reason = (req.body && req.body.reason) || (req.query && req.query.reason) || 'User 1-Click Sync';
  const syncResult = await performUniversalSync(reason);
  res.json({ ...syncResult });
});

// 8. Add request
app.post('/api/requests', (req, res) => {
  const reqData = req.body;
  const db = readDb();
  if (!db.requests) db.requests = [];
  db.requests.unshift(reqData);
  writeDb(db);
  res.json({ success: true, requests: db.requests });
});

// 9. Update request status
app.post('/api/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();
  if (db.requests) {
    db.requests = db.requests.map((r: any) => r.id === id ? { ...r, status } : r);
    writeDb(db);
  }
  res.json({ success: true, requests: db.requests });
});

// 10. Stats tracking
app.post('/api/stats/impression', (_req, res) => {
  const db = readDb();
  if (!db.stats) {
    db.stats = { impressions: 0, bannerViews: 0, directLinkClicks: 0, estimatedEarningsUsd: 0 };
  }
  db.stats.impressions += 1;
  db.stats.bannerViews += 1;
  db.stats.estimatedEarningsUsd = +(db.stats.estimatedEarningsUsd + 0.0018).toFixed(4);
  writeDb(db);
  res.json({ success: true, stats: db.stats });
});

app.post('/api/stats/click', (_req, res) => {
  const db = readDb();
  if (!db.stats) {
    db.stats = { impressions: 0, bannerViews: 0, directLinkClicks: 0, estimatedEarningsUsd: 0 };
  }
  db.stats.directLinkClicks += 1;
  db.stats.estimatedEarningsUsd = +(db.stats.estimatedEarningsUsd + 0.045).toFixed(4);
  writeDb(db);
  res.json({ success: true, stats: db.stats });
});

// 11. Git status endpoint (supports GET and POST)
app.all('/api/git-status', async (_req, res) => {
  try {
    await ensureGitInitialized();
    const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: __dirname });
    const { stdout: hashOut } = await execAsync('git rev-parse --short HEAD', { cwd: __dirname });
    const { stdout: logOut } = await execAsync('git log -1 --pretty=format:"%s|%cd"', { cwd: __dirname });
    const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: __dirname });

    const [lastCommitMessage, lastCommitDate] = logOut.split('|');
    const uncommittedFiles = statusOut
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    res.json({
      success: true,
      data: {
        branch: branchOut.trim() || 'main',
        lastCommitHash: hashOut.trim(),
        lastCommitMessage: lastCommitMessage || 'Initial commit',
        lastCommitDate: lastCommitDate || '',
        clean: uncommittedFiles.length === 0,
        uncommittedFiles
      }
    });
  } catch (err: any) {
    res.json({
      success: false,
      error: err?.message || String(err)
    });
  }
});

// 12. GitHub config get/save (supports both GET and POST)
app.all('/api/github-config', (req, res) => {
  if (req.method === 'POST') {
    const { repoUrl, branch, token, autoPush } = req.body || {};
    const updatePayload: Partial<GitHubConfigData> = {};
    if (repoUrl !== undefined) updatePayload.repoUrl = repoUrl;
    if (branch !== undefined) updatePayload.branch = branch;
    if (token !== undefined && token !== '') updatePayload.token = token;
    if (autoPush !== undefined) updatePayload.autoPush = autoPush;

    const saved = writeGithubConfig(updatePayload);
    return res.json({
      success: true,
      data: {
        repoUrl: saved.repoUrl,
        branch: saved.branch,
        hasToken: Boolean(saved.token && saved.token.length > 5),
        tokenMasked: saved.token ? `${saved.token.slice(0, 4)}••••••••${saved.token.slice(-4)}` : '',
        autoPush: saved.autoPush,
        lastPushStatus: saved.lastPushStatus || '',
        lastPushTime: saved.lastPushTime || ''
      }
    });
  }

  // GET or fallback
  const cfg = readGithubConfig();
  return res.json({
    success: true,
    data: {
      repoUrl: cfg.repoUrl,
      branch: cfg.branch,
      hasToken: Boolean(cfg.token && cfg.token.length > 5),
      tokenMasked: cfg.token ? `${cfg.token.slice(0, 4)}••••••••${cfg.token.slice(-4)}` : '',
      autoPush: cfg.autoPush,
      lastPushStatus: cfg.lastPushStatus || '',
      lastPushTime: cfg.lastPushTime || ''
    }
  });
});

// 13. Test GitHub connection via official GitHub REST API (Fast & Reliable, never hangs, supports GET and POST)
app.all('/api/github-test', async (req, res) => {
  try {
    const body = req.body || {};
    const query = req.query || {};
    const repoUrl = body.repoUrl || query.repoUrl;
    const token = body.token || query.token;
    const current = readGithubConfig();
    const targetRepo = repoUrl || current.repoUrl;
    const targetToken = token || current.token;

    if (!targetRepo || !targetRepo.trim()) {
      return res.json({
        success: false,
        message: '❌ GitHub Repository নাম লিখুন (যেমন: your-username/your-repo-name)।'
      });
    }

    if (!targetToken || !targetToken.trim()) {
      return res.json({
        success: false,
        message: '❌ GitHub Personal Access Token (PAT) দিন (যেমন: ghp_...)।'
      });
    }

    const cleanToken = targetToken.trim();
    const ownerRepo = parseOwnerRepo(targetRepo);
    if (!ownerRepo) {
      return res.json({
        success: false,
        message: '❌ রিপোজিটোরি ফরম্যাট সঠিক নয়। লিখুন: username/repo-name (যেমন: funnymovies887/movielover)'
      });
    }

    // Step 1: Verify token with GitHub User API
    const userController = new AbortController();
    const userTimeout = setTimeout(() => userController.abort(), 10000);

    let userRes: Response;
    try {
      userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${cleanToken}`,
          'User-Agent': 'MovieLover-Applet',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        signal: userController.signal
      });
    } finally {
      clearTimeout(userTimeout);
    }

    if (userRes.status === 401) {
      return res.json({
        success: false,
        message: '❌ টোকেন ভুল বা মেয়াদ শেষ (401 Bad credentials)। দয়া করে GitHub Settings -> Developer settings -> Personal access tokens (classic) থেকে নতুন টোকেন তৈরি করে পেস্ট করুন।'
      });
    }

    if (!userRes.ok) {
      const errText = await userRes.text();
      return res.json({
        success: false,
        message: `❌ GitHub API রেসপন্স এরর (${userRes.status}): ${errText.slice(0, 150)}`
      });
    }

    const userData: any = await userRes.json();
    const scopesHeader = userRes.headers.get('x-oauth-scopes') || '';
    const hasRepoScope = scopesHeader.split(',').map((s: string) => s.trim()).includes('repo');

    // Step 2: Verify repository access
    const repoController = new AbortController();
    const repoTimeout = setTimeout(() => repoController.abort(), 10000);

    let repoRes: Response;
    try {
      repoRes = await fetch(`https://api.github.com/repos/${ownerRepo}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${cleanToken}`,
          'User-Agent': 'MovieLover-Applet',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        signal: repoController.signal
      });
    } finally {
      clearTimeout(repoTimeout);
    }

    if (repoRes.status === 404) {
      const repoNameOnly = ownerRepo.split('/')[1] || ownerRepo;
      return res.json({
        success: false,
        message: `⚠️ টোকেন সঠিক (@${userData.login}), কিন্তু GitHub-এ "${ownerRepo}" নামের রিপোজিটোরিটি পাওয়া যায়নি (404 Not Found)।\n\n👉 সমাধান: দয়া করে আপনার GitHub অ্যাকাউন্টে যান এবং "${repoNameOnly}" নামে একটি নতুন রিপোজিটোরি তৈরি করুন (https://github.com/new), তারপর এখানে এসে আবার টেস্ট করুন।`
      });
    }

    if (!repoRes.ok) {
      return res.json({
        success: false,
        message: `⚠️ রিপোজিটোরি অ্যাক্সেস ব্যর্থ (${repoRes.status}): আপনার টোকেনে এই রিপোজিটোরি অ্যাক্সেস করার অনুমতি আছে কিনা নিশ্চিত করুন।`
      });
    }

    const repoData: any = await repoRes.json();
    const canPush = repoData.permissions?.push !== false;

    let successMsg = `✅ GitHub কানেকশন ১০০% সফল! ইউজার @${userData.login} হিসেবে "${ownerRepo}" রিপোজিটোরিতে অ্যাক্সেস নিশ্চিত করা হয়েছে।`;
    if (!hasRepoScope && !canPush) {
      successMsg += ` (⚠️ দ্রষ্টব্য: আপনার টোকেনে 'repo' পারমিশনে টিক দিন যাতে পুশ ব্লক না হয়)।`;
    }

    return res.json({
      success: true,
      message: successMsg,
      data: {
        login: userData.login,
        repo: repoData.full_name,
        private: repoData.private,
        defaultBranch: repoData.default_branch,
        canPush
      }
    });
  } catch (err: any) {
    const rawErr = (err?.message || String(err)).toString();
    return res.json({
      success: false,
      message: `❌ টেস্ট কানেকশন ব্যর্থ: ${rawErr.replace(/bearer\s+[a-z0-9_]+/gi, 'Bearer ***')}`
    });
  }
});

// 14. Manual push trigger (supports both GET and POST)
app.all('/api/github-push', async (_req, res) => {
  const result = await executeGitHubPush();
  res.json(result);
});

// 15. Export initialMovies.ts raw content
app.get('/api/export/initial-movies', (_req, res) => {
  try {
    if (fs.existsSync(INITIAL_MOVIES_FILE)) {
      const code = fs.readFileSync(INITIAL_MOVIES_FILE, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="initialMovies.ts"');
      return res.send(code);
    }
    res.status(404).json({ error: 'File not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed exporting file' });
  }
});

// --- VITE DEV MIDDLEWARE / STATIC PROD SERVING ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Movie Lover Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
