import { Router } from 'express';
import { readFile, writeFile, mkdir, readdir, rm, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const EXTENSIONS_DIR = path.join(__dirname, '..', '..', 'data', 'extensions');
const STORE_CATALOG = path.join(__dirname, '..', '..', 'data', 'extension-store.json');

// Ensure extensions directory exists
async function ensureExtensionsDir() {
  if (!existsSync(EXTENSIONS_DIR)) {
    await mkdir(EXTENSIONS_DIR, { recursive: true });
  }
}

// Built-in extension catalog (curated for mobile Brave)
const DEFAULT_CATALOG = [
  {
    id: 'claude-for-browsers',
    name: 'Claude for Browsers',
    version: '1.0.0',
    description: 'Anthropic Claude AI assistant integrated directly in your mobile browser. Chat, analyze pages, and get AI-powered assistance anywhere.',
    author: 'Anthropic',
    icon: 'brain',
    category: 'AI & Productivity',
    permissions: ['activeTab', 'storage', 'sidePanel'],
    manifestVersion: 3,
    rating: 4.9,
    users: '2M+',
    size: '1.2 MB',
    featured: true,
    bundled: true
  },
  {
    id: 'dark-reader',
    name: 'Dark Reader',
    version: '4.9.80',
    description: 'Dark mode for every website. Protect your eyes with a beautiful dark theme that adapts to any page.',
    author: 'Dark Reader Team',
    icon: 'moon',
    category: 'Appearance',
    permissions: ['activeTab', 'storage'],
    manifestVersion: 3,
    rating: 4.7,
    users: '5M+',
    size: '0.8 MB',
    featured: true,
    bundled: false
  },
  {
    id: 'ublock-origin',
    name: 'uBlock Origin',
    version: '1.57.2',
    description: 'Efficient wide-spectrum content blocker. Block ads, trackers, and malware domains on mobile.',
    author: 'Raymond Hill',
    icon: 'shield',
    category: 'Privacy & Security',
    permissions: ['webRequest', 'storage', 'tabs'],
    manifestVersion: 3,
    rating: 4.8,
    users: '10M+',
    size: '2.1 MB',
    featured: true,
    bundled: false
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden Password Manager',
    version: '2024.1.0',
    description: 'Secure password manager with autofill for mobile browsers. Access all your passwords anywhere.',
    author: 'Bitwarden Inc.',
    icon: 'lock',
    category: 'Privacy & Security',
    permissions: ['activeTab', 'storage', 'contextMenus'],
    manifestVersion: 3,
    rating: 4.6,
    users: '3M+',
    size: '1.5 MB',
    featured: false,
    bundled: false
  },
  {
    id: 'vimium',
    name: 'Vimium',
    version: '2.1.2',
    description: 'Navigate the web using only your keyboard. Adapted for mobile touch with gesture support.',
    author: 'Phil Crosby',
    icon: 'keyboard',
    category: 'Navigation',
    permissions: ['activeTab', 'tabs', 'storage'],
    manifestVersion: 3,
    rating: 4.5,
    users: '1M+',
    size: '0.5 MB',
    featured: false,
    bundled: false
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    version: '14.1100.0',
    description: 'AI writing assistant that checks grammar, spelling, punctuation, and style on mobile.',
    author: 'Grammarly',
    icon: 'spell-check',
    category: 'AI & Productivity',
    permissions: ['activeTab', 'storage'],
    manifestVersion: 3,
    rating: 4.4,
    users: '10M+',
    size: '3.2 MB',
    featured: false,
    bundled: false
  },
  {
    id: 'json-viewer',
    name: 'JSON Viewer',
    version: '1.5.0',
    description: 'Format and beautify JSON responses directly in your mobile browser with syntax highlighting.',
    author: 'Nicolo Davis',
    icon: 'braces',
    category: 'Developer Tools',
    permissions: ['activeTab'],
    manifestVersion: 3,
    rating: 4.3,
    users: '500K+',
    size: '0.3 MB',
    featured: false,
    bundled: false
  },
  {
    id: 'wappalyzer',
    name: 'Wappalyzer',
    version: '6.10.66',
    description: 'Identify technologies used on websites. See frameworks, CMS, analytics tools, and more.',
    author: 'Wappalyzer',
    icon: 'search-code',
    category: 'Developer Tools',
    permissions: ['activeTab', 'storage', 'webRequest'],
    manifestVersion: 3,
    rating: 4.5,
    users: '2M+',
    size: '1.8 MB',
    featured: false,
    bundled: false
  }
];

// Get extension store catalog
router.get('/store', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let catalog = [...DEFAULT_CATALOG];

    if (category && category !== 'all') {
      catalog = catalog.filter(ext => ext.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      catalog = catalog.filter(ext =>
        ext.name.toLowerCase().includes(q) ||
        ext.description.toLowerCase().includes(q) ||
        ext.author.toLowerCase().includes(q)
      );
    }

    if (featured === 'true') {
      catalog = catalog.filter(ext => ext.featured);
    }

    const categories = [...new Set(DEFAULT_CATALOG.map(ext => ext.category))];

    res.json({
      success: true,
      extensions: catalog,
      categories,
      total: catalog.length
    });
  } catch (error) {
    console.error('Extension store error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get installed extensions
router.get('/installed', async (req, res) => {
  try {
    await ensureExtensionsDir();
    const metadataPath = path.join(EXTENSIONS_DIR, 'installed.json');

    let installed = [];
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, 'utf-8');
      installed = JSON.parse(raw);
    }

    res.json({
      success: true,
      extensions: installed,
      count: installed.length
    });
  } catch (error) {
    console.error('Installed extensions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Install an extension
router.post('/install', async (req, res) => {
  try {
    const { extensionId } = req.body;
    await ensureExtensionsDir();

    const storeExt = DEFAULT_CATALOG.find(e => e.id === extensionId);
    if (!storeExt) {
      return res.status(404).json({ success: false, error: 'Extension not found in store' });
    }

    const metadataPath = path.join(EXTENSIONS_DIR, 'installed.json');
    let installed = [];
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, 'utf-8');
      installed = JSON.parse(raw);
    }

    if (installed.find(e => e.id === extensionId)) {
      return res.status(400).json({ success: false, error: 'Extension already installed' });
    }

    const installedExt = {
      ...storeExt,
      installedAt: new Date().toISOString(),
      enabled: true,
      settings: {}
    };

    installed.push(installedExt);
    await writeFile(metadataPath, JSON.stringify(installed, null, 2));

    // Create extension data directory
    const extDir = path.join(EXTENSIONS_DIR, extensionId);
    if (!existsSync(extDir)) {
      await mkdir(extDir, { recursive: true });
    }

    // Write default extension config
    await writeFile(
      path.join(extDir, 'config.json'),
      JSON.stringify({ enabled: true, settings: {} }, null, 2)
    );

    res.json({
      success: true,
      extension: installedExt,
      message: `${storeExt.name} installed successfully`
    });
  } catch (error) {
    console.error('Extension install error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Uninstall an extension
router.post('/uninstall', async (req, res) => {
  try {
    const { extensionId } = req.body;
    await ensureExtensionsDir();

    const metadataPath = path.join(EXTENSIONS_DIR, 'installed.json');
    let installed = [];
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, 'utf-8');
      installed = JSON.parse(raw);
    }

    const ext = installed.find(e => e.id === extensionId);
    if (!ext) {
      return res.status(404).json({ success: false, error: 'Extension not installed' });
    }

    installed = installed.filter(e => e.id !== extensionId);
    await writeFile(metadataPath, JSON.stringify(installed, null, 2));

    // Remove extension data directory
    const extDir = path.join(EXTENSIONS_DIR, extensionId);
    if (existsSync(extDir)) {
      await rm(extDir, { recursive: true });
    }

    res.json({
      success: true,
      message: `${ext.name} uninstalled successfully`
    });
  } catch (error) {
    console.error('Extension uninstall error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle extension enabled/disabled
router.post('/toggle', async (req, res) => {
  try {
    const { extensionId } = req.body;
    await ensureExtensionsDir();

    const metadataPath = path.join(EXTENSIONS_DIR, 'installed.json');
    let installed = [];
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, 'utf-8');
      installed = JSON.parse(raw);
    }

    const extIndex = installed.findIndex(e => e.id === extensionId);
    if (extIndex === -1) {
      return res.status(404).json({ success: false, error: 'Extension not installed' });
    }

    installed[extIndex].enabled = !installed[extIndex].enabled;
    await writeFile(metadataPath, JSON.stringify(installed, null, 2));

    res.json({
      success: true,
      extension: installed[extIndex],
      message: `${installed[extIndex].name} ${installed[extIndex].enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Extension toggle error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update extension settings
router.post('/settings', async (req, res) => {
  try {
    const { extensionId, settings } = req.body;
    await ensureExtensionsDir();

    const metadataPath = path.join(EXTENSIONS_DIR, 'installed.json');
    let installed = [];
    if (existsSync(metadataPath)) {
      const raw = await readFile(metadataPath, 'utf-8');
      installed = JSON.parse(raw);
    }

    const extIndex = installed.findIndex(e => e.id === extensionId);
    if (extIndex === -1) {
      return res.status(404).json({ success: false, error: 'Extension not installed' });
    }

    installed[extIndex].settings = { ...installed[extIndex].settings, ...settings };
    await writeFile(metadataPath, JSON.stringify(installed, null, 2));

    // Also update per-extension config
    const extDir = path.join(EXTENSIONS_DIR, extensionId);
    if (existsSync(extDir)) {
      await writeFile(
        path.join(extDir, 'config.json'),
        JSON.stringify({ enabled: installed[extIndex].enabled, settings: installed[extIndex].settings }, null, 2)
      );
    }

    res.json({
      success: true,
      extension: installed[extIndex]
    });
  } catch (error) {
    console.error('Extension settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Claude extension runtime data (special endpoint for the bundled Claude extension)
router.get('/claude-runtime', async (req, res) => {
  try {
    res.json({
      success: true,
      runtime: {
        name: 'Claude for Browsers',
        version: '1.0.0',
        manifest: {
          manifest_version: 3,
          name: 'Claude for Browsers',
          version: '1.0.0',
          description: 'Anthropic Claude AI assistant for mobile browsers',
          permissions: ['activeTab', 'storage', 'sidePanel'],
          action: {
            default_popup: 'popup.html',
            default_icon: { '16': 'icon16.png', '48': 'icon48.png', '128': 'icon128.png' }
          },
          side_panel: {
            default_path: 'sidepanel.html'
          },
          background: {
            service_worker: 'background.js',
            type: 'module'
          },
          content_scripts: [{
            matches: ['<all_urls>'],
            js: ['content.js'],
            css: ['content.css']
          }]
        },
        capabilities: {
          chat: true,
          pageAnalysis: true,
          textSelection: true,
          sidePanel: true,
          contextMenu: true,
          quickActions: true
        },
        apiEndpoint: '/api/claude/chat',
        models: ['claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20250929']
      }
    });
  } catch (error) {
    console.error('Claude runtime error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extension proxy - fetch web content for extensions that need it
router.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Only allow HTTPS URLs for security
    if (!url.startsWith('https://')) {
      return res.status(400).json({ success: false, error: 'Only HTTPS URLs are allowed' });
    }

    const fetchOptions = {
      method,
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Brave/121', ...headers }
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    let data;
    if (contentType.includes('json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.json({
      success: true,
      status: response.status,
      contentType,
      data
    });
  } catch (error) {
    console.error('Extension proxy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as extensionsRouter };
