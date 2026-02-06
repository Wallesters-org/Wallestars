/**
 * Extension Runtime Engine
 *
 * Polyfills Chrome Extension APIs for running extensions
 * in a mobile web context. Provides chrome.runtime, chrome.storage,
 * chrome.tabs, and other essential APIs.
 */

class ExtensionStorage {
  constructor(extensionId) {
    this.prefix = `ext_${extensionId}_`;
  }

  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  get local() {
    return {
      get: (keys) => {
        return new Promise((resolve) => {
          const result = {};
          const keyList = typeof keys === 'string' ? [keys] : (Array.isArray(keys) ? keys : Object.keys(keys || {}));

          keyList.forEach(key => {
            const stored = localStorage.getItem(this._getKey(key));
            if (stored !== null) {
              try {
                result[key] = JSON.parse(stored);
              } catch {
                result[key] = stored;
              }
            } else if (typeof keys === 'object' && !Array.isArray(keys) && keys[key] !== undefined) {
              result[key] = keys[key];
            }
          });
          resolve(result);
        });
      },
      set: (items) => {
        return new Promise((resolve) => {
          Object.entries(items).forEach(([key, value]) => {
            localStorage.setItem(this._getKey(key), JSON.stringify(value));
          });
          resolve();
        });
      },
      remove: (keys) => {
        return new Promise((resolve) => {
          const keyList = typeof keys === 'string' ? [keys] : keys;
          keyList.forEach(key => localStorage.removeItem(this._getKey(key)));
          resolve();
        });
      },
      clear: () => {
        return new Promise((resolve) => {
          const toRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
              toRemove.push(key);
            }
          }
          toRemove.forEach(key => localStorage.removeItem(key));
          resolve();
        });
      }
    };
  }

  get sync() {
    // In mobile context, sync and local behave the same
    return this.local;
  }
}

class ExtensionRuntime {
  constructor(extensionId, manifest) {
    this.extensionId = extensionId;
    this.manifest = manifest;
    this.listeners = new Map();
    this.ports = new Map();
  }

  get id() {
    return this.extensionId;
  }

  getManifest() {
    return this.manifest;
  }

  getURL(path) {
    return `/extensions/${this.extensionId}/${path}`;
  }

  sendMessage(message, callback) {
    const event = 'message';
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => {
      const response = handler(message, { id: this.extensionId }, callback || (() => {}));
      if (callback && response !== undefined) callback(response);
    });
  }

  onMessage = {
    _listeners: [],
    addListener: (callback) => {
      if (!this.listeners.has('message')) this.listeners.set('message', []);
      this.listeners.get('message').push(callback);
      this.onMessage._listeners.push(callback);
    },
    removeListener: (callback) => {
      const msgs = this.listeners.get('message') || [];
      this.listeners.set('message', msgs.filter(l => l !== callback));
      this.onMessage._listeners = this.onMessage._listeners.filter(l => l !== callback);
    },
    hasListener: (callback) => this.onMessage._listeners.includes(callback)
  };

  onInstalled = {
    _listeners: [],
    addListener: (callback) => {
      this.onInstalled._listeners.push(callback);
      // Fire immediately for newly "installed" extensions
      setTimeout(() => callback({ reason: 'install' }), 0);
    },
    removeListener: (callback) => {
      this.onInstalled._listeners = this.onInstalled._listeners.filter(l => l !== callback);
    }
  };

  connect(connectInfo) {
    const portId = `port_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const port = {
      name: connectInfo?.name || '',
      postMessage: (msg) => {
        const handlers = port.onMessage._listeners;
        handlers.forEach(h => h(msg));
      },
      onMessage: {
        _listeners: [],
        addListener: (cb) => port.onMessage._listeners.push(cb),
        removeListener: (cb) => { port.onMessage._listeners = port.onMessage._listeners.filter(l => l !== cb); }
      },
      onDisconnect: {
        _listeners: [],
        addListener: (cb) => port.onDisconnect._listeners.push(cb),
        removeListener: (cb) => { port.onDisconnect._listeners = port.onDisconnect._listeners.filter(l => l !== cb); }
      },
      disconnect: () => {
        port.onDisconnect._listeners.forEach(cb => cb(port));
        this.ports.delete(portId);
      }
    };
    this.ports.set(portId, port);
    return port;
  }
}

class ExtensionTabs {
  query(queryInfo) {
    return Promise.resolve([{
      id: 1,
      url: window.location.href,
      title: document.title,
      active: true,
      windowId: 1
    }]);
  }

  create(createProperties) {
    if (createProperties.url) {
      window.open(createProperties.url, '_blank');
    }
    return Promise.resolve({ id: Date.now(), ...createProperties });
  }

  sendMessage(tabId, message) {
    return Promise.resolve();
  }

  onUpdated = {
    _listeners: [],
    addListener: (cb) => this.onUpdated._listeners.push(cb),
    removeListener: (cb) => { this.onUpdated._listeners = this.onUpdated._listeners.filter(l => l !== cb); }
  };

  onActivated = {
    _listeners: [],
    addListener: (cb) => this.onActivated._listeners.push(cb),
    removeListener: (cb) => { this.onActivated._listeners = this.onActivated._listeners.filter(l => l !== cb); }
  };
}

class ExtensionAction {
  constructor() {
    this._popup = '';
    this._badge = '';
    this._badgeColor = '#000';
    this._icon = {};
    this._title = '';
  }

  setPopup(details) { this._popup = details.popup; }
  getPopup() { return Promise.resolve(this._popup); }
  setBadgeText(details) { this._badge = details.text; }
  getBadgeText() { return Promise.resolve(this._badge); }
  setBadgeBackgroundColor(details) { this._badgeColor = details.color; }
  setIcon(details) { this._icon = details; }
  setTitle(details) { this._title = details.title; }

  onClicked = {
    _listeners: [],
    addListener: (cb) => this.onClicked._listeners.push(cb),
    removeListener: (cb) => { this.onClicked._listeners = this.onClicked._listeners.filter(l => l !== cb); }
  };
}

class ExtensionContextMenus {
  constructor() {
    this._menus = new Map();
  }

  create(createProperties, callback) {
    const id = createProperties.id || `menu_${Date.now()}`;
    this._menus.set(id, createProperties);
    if (callback) callback();
    return id;
  }

  remove(menuItemId, callback) {
    this._menus.delete(menuItemId);
    if (callback) callback();
  }

  removeAll(callback) {
    this._menus.clear();
    if (callback) callback();
  }

  onClicked = {
    _listeners: [],
    addListener: (cb) => this.onClicked._listeners.push(cb),
    removeListener: (cb) => { this.onClicked._listeners = this.onClicked._listeners.filter(l => l !== cb); }
  };

  getMenuItems() {
    return Array.from(this._menus.values());
  }
}

class ExtensionSidePanel {
  constructor() {
    this._options = {};
  }

  setOptions(options) {
    this._options = { ...this._options, ...options };
    return Promise.resolve();
  }

  getOptions() {
    return Promise.resolve(this._options);
  }

  open() {
    return Promise.resolve();
  }
}

/**
 * Create a full chrome.* API polyfill for a given extension
 */
export function createExtensionAPI(extensionId, manifest = {}) {
  const storage = new ExtensionStorage(extensionId);
  const runtime = new ExtensionRuntime(extensionId, manifest);
  const tabs = new ExtensionTabs();
  const action = new ExtensionAction();
  const contextMenus = new ExtensionContextMenus();
  const sidePanel = new ExtensionSidePanel();

  return {
    runtime,
    storage,
    tabs,
    action,
    contextMenus,
    sidePanel,
    i18n: {
      getMessage: (key) => key,
      getUILanguage: () => navigator.language || 'en'
    },
    permissions: {
      contains: () => Promise.resolve(true),
      request: () => Promise.resolve(true)
    },
    alarms: {
      _alarms: new Map(),
      create: (name, info) => {
        const alarm = { name, ...info, scheduledTime: Date.now() + (info.delayInMinutes || 0) * 60000 };
        chrome.alarms._alarms.set(name, alarm);
      },
      get: (name) => Promise.resolve(chrome.alarms._alarms.get(name)),
      getAll: () => Promise.resolve(Array.from(chrome.alarms._alarms.values())),
      clear: (name) => { chrome.alarms._alarms.delete(name); return Promise.resolve(true); },
      onAlarm: {
        _listeners: [],
        addListener: (cb) => chrome.alarms.onAlarm._listeners.push(cb),
        removeListener: (cb) => { chrome.alarms.onAlarm._listeners = chrome.alarms.onAlarm._listeners.filter(l => l !== cb); }
      }
    }
  };
}

/**
 * Registry of all active extension runtimes
 */
class ExtensionRuntimeRegistry {
  constructor() {
    this.runtimes = new Map();
  }

  register(extensionId, manifest) {
    const api = createExtensionAPI(extensionId, manifest);
    this.runtimes.set(extensionId, api);
    return api;
  }

  get(extensionId) {
    return this.runtimes.get(extensionId);
  }

  unregister(extensionId) {
    this.runtimes.delete(extensionId);
  }

  getAll() {
    return Array.from(this.runtimes.entries()).map(([id, api]) => ({
      id,
      manifest: api.runtime.getManifest(),
      api
    }));
  }
}

export const extensionRegistry = new ExtensionRuntimeRegistry();
export default extensionRegistry;
