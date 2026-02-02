import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Wifi,
  WifiOff,
  Send,
  RefreshCw,
  Settings,
  Terminal,
  Smartphone,
  Monitor,
  QrCode,
  FileText,
  Zap,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Channel icons mapping
const channelIcons = {
  telegram: '📱',
  whatsapp: '💬',
  discord: '🎮',
  slack: '💼',
  signal: '🔒',
  imessage: '🍎',
  teams: '👥',
  webchat: '🌐'
};

export default function OpenClawIntegration() {
  const [status, setStatus] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('ws://127.0.0.1:18789');
  const [showSettings, setShowSettings] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch OpenClaw status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/openclaw/status');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Failed to fetch OpenClaw status:', error);
      setStatus({ connected: false, error: error.message });
    }
  }, []);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/openclaw/sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, []);

  // Fetch nodes
  const fetchNodes = useCallback(async () => {
    try {
      const response = await fetch('/api/openclaw/nodes');
      const data = await response.json();
      if (data.success) {
        setNodes(data.nodes || []);
      }
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchSessions(), fetchNodes()]);
      setLoading(false);
    };
    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchSessions();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchSessions, fetchNodes]);

  // Connect to OpenClaw Gateway
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/openclaw/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayUrl })
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
        fetchSessions();
        fetchNodes();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect from Gateway
  const handleDisconnect = async () => {
    try {
      await fetch('/api/openclaw/disconnect', { method: 'POST' });
      setStatus({ connected: false });
      setSessions([]);
      setNodes([]);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  // Send message to session
  const handleSendMessage = async () => {
    if (!selectedSession || !messageInput.trim()) return;

    try {
      const response = await fetch(`/api/openclaw/sessions/${selectedSession.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput })
      });
      const data = await response.json();
      if (data.success) {
        setMessageInput('');
        // Refresh sessions to get updated history
        fetchSessions();
      }
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  // Test webhook
  const handleTestWebhook = async () => {
    try {
      const response = await fetch('/api/openclaw/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          sessionId: 'test-session',
          channel: 'webchat',
          userId: 'test-user',
          content: '/ws status'
        })
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  // Feature cards for Wallestars capabilities
  const features = [
    { icon: MessageSquare, name: 'Claude Chat', command: '/ws chat', color: 'purple' },
    { icon: Monitor, name: 'Screenshot', command: '/ws screenshot', color: 'blue' },
    { icon: Terminal, name: 'Computer Control', command: '/ws click/type', color: 'green' },
    { icon: Smartphone, name: 'Android', command: '/ws android', color: 'orange' },
    { icon: QrCode, name: 'QR Scanner', command: '/ws qr', color: 'pink' },
    { icon: FileText, name: 'Smart Scan', command: '/ws scan', color: 'cyan' },
    { icon: Zap, name: 'Orchestration', command: '/ws orch', color: 'yellow' },
    { icon: Users, name: 'Prompt Gen', command: '/ws prompt', color: 'indigo' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🦞</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">OpenClaw Integration</h1>
              <p className="text-dark-400">
                Multi-platform messaging via Telegram, WhatsApp, Discord, Slack & more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              status?.connected
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {status?.connected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Disconnected</span>
                </>
              )}
            </div>

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary p-2"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchStatus();
                fetchSessions();
                fetchNodes();
              }}
              className="btn-secondary p-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-dark-700"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Gateway URL</label>
                  <input
                    type="text"
                    value={gatewayUrl}
                    onChange={(e) => setGatewayUrl(e.target.value)}
                    className="input-field w-full"
                    placeholder="ws://127.0.0.1:18789"
                  />
                </div>
                <div className="flex items-end gap-2">
                  {status?.connected ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDisconnect}
                      className="btn-secondary flex-1"
                    >
                      Disconnect
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConnect}
                      disabled={connecting}
                      className="btn-primary flex-1"
                    >
                      {connecting ? 'Connecting...' : 'Connect'}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTestWebhook}
                    className="btn-secondary"
                  >
                    Test Webhook
                  </motion.button>
                </div>
              </div>

              {testResult && (
                <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                  <p className="text-sm font-mono">
                    {JSON.stringify(testResult, null, 2)}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Supported Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-400" />
          Supported Channels
        </h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(channelIcons).map(([channel, icon]) => (
            <div
              key={channel}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-lg"
            >
              <span className="text-xl">{icon}</span>
              <span className="capitalize">{channel}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-400" />
          Available Wallestars Features via Chat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 bg-dark-800/50 rounded-lg hover:bg-dark-700/50 transition-colors cursor-pointer group"
            >
              <feature.icon className={`w-8 h-8 mb-2 text-${feature.color}-400`} />
              <h3 className="font-semibold">{feature.name}</h3>
              <p className="text-sm text-dark-400 font-mono">{feature.command}</p>
              <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors mt-2" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sessions & Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-400" />
            Active Sessions
            <span className="ml-auto text-sm text-dark-400">
              {sessions.length} sessions
            </span>
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active sessions</p>
              <p className="text-sm mt-1">
                {status?.connected
                  ? 'Start a conversation from any channel'
                  : 'Connect to OpenClaw Gateway first'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedSession(session)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'bg-dark-800/50 hover:bg-dark-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {channelIcons[session.channel] || '💬'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{session.userId || session.id}</p>
                      <p className="text-xs text-dark-400">
                        {session.channel} • {session.messageCount || 0} messages
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      session.active ? 'bg-green-400' : 'bg-dark-500'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Send Message */}
          {selectedSession && (
            <div className="mt-4 pt-4 border-t border-dark-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Send to ${selectedSession.userId || selectedSession.id}...`}
                  className="input-field flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="btn-primary px-4"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Connected Nodes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary-400" />
            Device Nodes
            <span className="ml-auto text-sm text-dark-400">
              {nodes.length} nodes
            </span>
          </h2>

          {nodes.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No device nodes connected</p>
              <p className="text-sm mt-1">
                Connect macOS, iOS, or Android nodes to OpenClaw
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 bg-dark-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {node.type === 'macos' && <Monitor className="w-5 h-5 text-blue-400" />}
                    {node.type === 'ios' && <Smartphone className="w-5 h-5 text-gray-400" />}
                    {node.type === 'android' && <Smartphone className="w-5 h-5 text-green-400" />}
                    <div className="flex-1">
                      <p className="font-medium">{node.name || node.id}</p>
                      <p className="text-xs text-dark-400">
                        {node.type} • {node.capabilities?.length || 0} capabilities
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      node.online ? 'text-green-400' : 'text-dark-500'
                    }`}>
                      {node.online ? (
                        <><CheckCircle className="w-3 h-3" /> Online</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Offline</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Commands Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary-400" />
          Quick Commands Reference
        </h2>
        <div className="bg-dark-800/50 rounded-lg p-4 font-mono text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className="text-primary-400">/ws help</span> - Show all commands</div>
            <div><span className="text-primary-400">/ws status</span> - System status</div>
            <div><span className="text-primary-400">/ws chat &lt;msg&gt;</span> - Chat with Claude</div>
            <div><span className="text-primary-400">/ws screenshot</span> - Take screenshot</div>
            <div><span className="text-primary-400">/ws click &lt;x&gt; &lt;y&gt;</span> - Click at coordinates</div>
            <div><span className="text-primary-400">/ws type &lt;text&gt;</span> - Type text</div>
            <div><span className="text-primary-400">/ws android tap &lt;x&gt; &lt;y&gt;</span> - Android tap</div>
            <div><span className="text-primary-400">/ws qr generate &lt;text&gt;</span> - Generate QR</div>
            <div><span className="text-primary-400">/ws orch status</span> - Orchestration status</div>
            <div><span className="text-primary-400">/ws prompt &lt;topic&gt;</span> - Generate prompt</div>
          </div>
        </div>
      </motion.div>

      {/* Documentation Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🦞</span>
            <div>
              <h3 className="font-semibold">OpenClaw Documentation</h3>
              <p className="text-sm text-dark-400">
                Learn more about OpenClaw multi-platform AI assistant
              </p>
            </div>
          </div>
          <a
            href="https://docs.openclaw.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Docs
          </a>
        </div>
      </motion.div>
    </div>
  );
}
