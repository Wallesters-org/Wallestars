import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Inbox,
  Send,
  RefreshCw,
  Settings,
  Download,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  Lock,
  FileText,
  Key,
  Shield,
  Clock
} from 'lucide-react';

export default function EmailIntegration() {
  const [config, setConfig] = useState({
    user: '',
    password: '',
    provider: 'hostinger',
    host: 'imap.hostinger.com',
    imapPort: 993,
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 465
  });
  const [configStatus, setConfigStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [emails, setEmails] = useState([]);
  const [authCodes, setAuthCodes] = useState([]);
  const [mailboxes, setMailboxes] = useState([]);
  const [selectedMailbox, setSelectedMailbox] = useState('INBOX');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('config');

  // Fetch current configuration status
  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch('/api/email/config');
      const data = await response.json();
      if (data.success) {
        setConfigStatus(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.imapPort
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        fetchConfigStatus();
      } else {
        setError(data.details || data.error);
      }
    } catch (error) {
      setError(`Connection failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleFetchEmails = async () => {
    setFetching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.imapPort,
          mailbox: selectedMailbox,
          limit: 50
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.messages);
        setSuccess(`Fetched ${data.total} emails from ${data.mailbox}`);
        setActiveTab('inbox');
      } else {
        setError(data.details || data.error);
      }
    } catch (error) {
      setError(`Failed to fetch emails: ${error.message}`);
    } finally {
      setFetching(false);
    }
  };

  const handleFetchForAnalysis = async () => {
    setFetching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/fetch-and-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.imapPort,
          mailbox: selectedMailbox,
          limit: 50
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.ready_for_analysis) {
        // Save to localStorage for Telegram Analysis page
        localStorage.setItem('imported_messages', JSON.stringify(data.messages));
        localStorage.setItem('message_source', 'email');
        
        setSuccess(`Prepared ${data.total} emails for analysis. Switch to Telegram Analysis to continue.`);
      } else {
        setError(data.details || data.error);
      }
    } catch (error) {
      setError(`Failed to fetch emails: ${error.message}`);
    } finally {
      setFetching(false);
    }
  };

  const handleExportEmails = () => {
    if (emails.length === 0) {
      setError('No emails to export');
      return;
    }
    
    const dataStr = JSON.stringify(emails, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emails_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccess('Emails exported successfully');
  };

  const handleExtractAuthCodes = async () => {
    setFetching(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email/extract-auth-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.imapPort,
          provider: config.provider,
          mailbox: selectedMailbox,
          limit: 10
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAuthCodes(data.authCodes);
        setSuccess(`Found ${data.total} authentication codes in ${data.checked} messages`);
        setActiveTab('authcodes');
      } else {
        setError(data.details || data.error);
      }
    } catch (error) {
      setError(`Failed to extract auth codes: ${error.message}`);
    } finally {
      setFetching(false);
    }
  };

  const handleMonitorAuthCodes = async () => {
    setMonitoring(true);
    setError(null);
    setSuccess('Monitoring for new authentication codes... (60s timeout)');
    
    try {
      const response = await fetch('/api/email/monitor-auth-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.imapPort,
          provider: config.provider,
          mailbox: selectedMailbox,
          timeout: 60000
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.found) {
          setSuccess(`✅ Authentication code received: ${data.firstCode}`);
          setAuthCodes([data.authCode, ...authCodes]);
          setActiveTab('authcodes');
        } else {
          setError(data.message || 'No authentication code received within timeout');
        }
      } else {
        setError(data.details || data.error);
      }
    } catch (error) {
      setError(`Monitoring failed: ${error.message}`);
    } finally {
      setMonitoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Email Integration & Auth Code Extraction
            </h1>
          </div>
          <p className="text-gray-400">
            Connect to Gmail/Hostinger to fetch emails and extract authentication codes for automation workflows
          </p>
        </motion.div>

        {/* Configuration Status */}
        {configStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">IMAP:</span>
                  {configStatus.imap.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">{configStatus.imap.host}:{configStatus.imap.port}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">SMTP:</span>
                  {configStatus.smtp.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">{configStatus.smtp.host}:{configStatus.smtp.port}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['config', 'authcodes', 'inbox', 'send'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'authcodes' ? 'Auth Codes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Success</p>
              <p className="text-green-300 text-sm mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-400 hover:text-green-300"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Email Configuration
            </h2>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email Provider
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => {
                    const provider = e.target.value;
                    const providerDefaults = {
                      hostinger: { host: 'imap.hostinger.com', imapPort: 993, smtpHost: 'smtp.hostinger.com', smtpPort: 465 },
                      gmail: { host: 'imap.gmail.com', imapPort: 993, smtpHost: 'smtp.gmail.com', smtpPort: 465 },
                      workmail: { host: 'imap.mail.eu-west-1.awsapps.com', imapPort: 993, smtpHost: 'smtp.mail.eu-west-1.awsapps.com', smtpPort: 465 }
                    };
                    setConfig({ ...config, provider, ...providerDefaults[provider] });
                  }}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="hostinger">Hostinger</option>
                  <option value="gmail">Gmail</option>
                  <option value="workmail">AWS WorkMail</option>
                </select>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={config.user}
                  onChange={(e) => setConfig({ ...config, user: e.target.value })}
                  placeholder={config.provider === 'gmail' ? 'miropetrovski12@gmail.com' : 'your-email@domain.com'}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password {config.provider === 'gmail' && '(App Password)'}
                </label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder={config.provider === 'gmail' ? 'App-specific password' : 'Your email password'}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                {config.provider === 'gmail' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Use an App Password from Google Account → Security → 2-Step Verification → App passwords
                  </p>
                )}
              </div>

              {/* IMAP Server */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    IMAP Host
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    IMAP Port
                  </label>
                  <input
                    type="number"
                    value={config.imapPort}
                    onChange={(e) => setConfig({ ...config, imapPort: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SMTP Server */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={config.smtpHost}
                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={config.smtpPort}
                    onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={testing || !config.user || !config.password}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    {testing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Test Connection
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleFetchEmails}
                    disabled={fetching || !config.user || !config.password}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    {fetching ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Inbox className="w-5 h-5" />
                        Fetch Emails
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleFetchForAnalysis}
                    disabled={fetching || !config.user || !config.password}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Fetch for Analysis
                  </button>
                </div>

                {/* Auth Code Extraction Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleExtractAuthCodes}
                    disabled={fetching || !config.user || !config.password}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    {fetching ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5" />
                        Extract Auth Codes
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleMonitorAuthCodes}
                    disabled={monitoring || !config.user || !config.password}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    {monitoring ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Monitoring...
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5" />
                        Monitor for Codes (60s)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Provider Settings:</strong><br />
                  {config.provider === 'gmail' && (
                    <>Gmail: imap.gmail.com:993 / smtp.gmail.com:465 (Use App Password)</>
                  )}
                  {config.provider === 'hostinger' && (
                    <>Hostinger: imap.hostinger.com:993 / smtp.hostinger.com:465</>
                  )}
                  {config.provider === 'workmail' && (
                    <>AWS WorkMail: imap.mail.eu-west-1.awsapps.com:993</>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Auth Codes Tab */}
        {activeTab === 'authcodes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Key className="w-6 h-6" />
                Authentication Codes ({authCodes.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExtractAuthCodes}
                  disabled={fetching}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                  Extract
                </button>
                <button
                  onClick={handleMonitorAuthCodes}
                  disabled={monitoring}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Clock className={`w-4 h-4 ${monitoring ? 'animate-spin' : ''}`} />
                  Monitor
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {authCodes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No authentication codes found. Click "Extract" to scan recent emails.</p>
                  <p className="text-sm mt-2">Or click "Monitor" to wait for new codes (60s timeout)</p>
                </div>
              ) : (
                authCodes.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-amber-500/10 to-teal-500/10 rounded-lg p-4 border border-amber-500/30 hover:border-amber-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white">{item.subject}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">From: {item.from}</p>
                    
                    {/* Display extracted codes prominently */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-3">
                      <p className="text-xs text-gray-500 mb-2">AUTHENTICATION CODES:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.codes.map((code, i) => (
                          <div
                            key={i}
                            className="bg-amber-500 text-gray-900 font-mono font-bold px-4 py-2 rounded text-lg cursor-pointer hover:bg-amber-400 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                              setSuccess(`Code copied: ${code}`);
                            }}
                            title="Click to copy"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {item.snippet && (
                      <p className="text-sm text-gray-500 line-clamp-2">{item.snippet}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Inbox className="w-6 h-6" />
                Inbox ({emails.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleFetchEmails}
                  disabled={fetching}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleExportEmails}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {emails.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No emails loaded. Click "Fetch Emails" to load messages.</p>
                </div>
              ) : (
                emails.map((email, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{email.subject}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(email.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">From: {email.from}</p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {email.text.substring(0, 200)}
                      {email.text.length > 200 ? '...' : ''}
                    </p>
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {email.attachments.map((att, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-600 px-2 py-1 rounded"
                          >
                            📎 {att.filename}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Send Tab */}
        {activeTab === 'send' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Send className="w-6 h-6" />
              Send Email
            </h2>
            <p className="text-gray-400 mb-4">
              SMTP email sending functionality coming soon...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
