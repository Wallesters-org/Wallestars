import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Upload,
  Download,
  BarChart3,
  GitBranch,
  CheckSquare,
  Globe,
  User,
  Loader,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function TelegramAnalysis() {
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState('');

  // Fetch categories and priorities on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/telegram/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
        setPriorities(data.priorities);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      let parsedMessages = [];

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        parsedMessages = Array.isArray(data) ? data : [data];
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV properly - skip header and handle quoted values
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          parsedMessages = lines.slice(1).map((line, index) => {
            // Simple CSV parsing - for production, consider a proper CSV library
            const match = line.match(/^"([^"]*)","([^"]*)","([^"]*)"$/);
            if (match) {
              return {
                id: index + 1,
                content: match[1],
                timestamp: match[2] || new Date().toISOString(),
                sender: match[3] || 'unknown'
              };
            }
            // Fallback for unquoted CSV
            const values = line.split(',');
            return {
              id: index + 1,
              content: values[0] || '',
              timestamp: values[1] || new Date().toISOString(),
              sender: values[2] || 'unknown'
            };
          });
        }
      } else {
        // Treat as plain text - one message
        parsedMessages = [{
          id: 1,
          content: text,
          timestamp: new Date().toISOString(),
          sender: 'imported'
        }];
      }

      setMessages(parsedMessages);
      setActiveTab('messages');
    } catch (error) {
      console.error('Error parsing file:', error);
      setMessages([{
        id: 'error',
        content: `Error parsing file: ${error.message}. Please check the file format.`,
        timestamp: new Date().toISOString(),
        sender: 'system_error',
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual message input
  const handleManualInput = () => {
    setShowMessageForm(true);
  };

  const submitManualMessage = () => {
    if (newMessageContent.trim()) {
      const newMessage = {
        id: messages.length + 1,
        content: newMessageContent,
        timestamp: new Date().toISOString(),
        sender: 'manual'
      };
      setMessages([...messages, newMessage]);
      setNewMessageContent('');
      setShowMessageForm(false);
      setError(null);
    }
  };

  // Analyze messages
  const analyzeMessages = async () => {
    if (messages.length === 0) {
      setError('Please upload or add messages first');
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setError(null);
    const results = [];

    try {
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const response = await fetch('/api/telegram/analyze-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: { id: message.id },
            content: message.content,
            timestamp: message.timestamp,
            sender: message.sender
          })
        });

        const result = await response.json();
        results.push(result);
        setProgress(Math.round(((i + 1) / messages.length) * 100));
      }

      setAnalysisResults(results);
      
      // Generate report
      const reportResponse = await fetch('/api/telegram/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          analysis_results: results
        })
      });

      const reportData = await reportResponse.json();
      if (reportData.success) {
        setStatistics(reportData.statistics);
        setReportMarkdown(reportData.report_markdown);
      }

      setActiveTab('results');
    } catch (error) {
      console.error('Error analyzing messages:', error);
      setError(`Error analyzing messages: ${error.message}. Please check your API key and connection.`);
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  // Export data
  const exportData = async (format) => {
    if (!statistics) {
      setError('No analysis results to export');
      return;
    }

    setError(null);
    try {
      const response = await fetch('/api/telegram/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          data: {
            statistics,
            results: analysisResults,
            report_markdown: reportMarkdown
          }
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `telegram_export_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError(`Error exporting data: ${error.message}. Please try again.`);
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
            <MessageSquare className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Telegram Message Analysis
            </h1>
          </div>
          <p className="text-gray-400">
            Analyze and classify Telegram Saved Messages with AI-powered categorization
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['upload', 'messages', 'analyze', 'results', 'report'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6">Upload Messages</h2>
            
            <div className="space-y-6">
              {/* File upload */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">
                  Upload JSON, CSV, or text file with messages
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer inline-block">
                    Choose File
                  </span>
                </label>
              </div>

              {/* Manual input */}
              <div>
                {!showMessageForm ? (
                  <button
                    onClick={handleManualInput}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Add Message Manually
                  </button>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <label className="block">
                      <span className="text-sm text-gray-400 mb-2 block">Message Content:</span>
                      <textarea
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Enter message content..."
                        className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:outline-none min-h-[100px]"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={submitManualMessage}
                        disabled={!newMessageContent.trim()}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                      >
                        Add Message
                      </button>
                      <button
                        onClick={() => {
                          setShowMessageForm(false);
                          setNewMessageContent('');
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              {messages.length > 0 && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400">
                    ✅ {messages.length} message{messages.length !== 1 ? 's' : ''} loaded
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6">
              Messages ({messages.length})
            </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-400">
                      Message #{msg.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {msg.content.substring(0, 200)}
                    {msg.content.length > 200 ? '...' : ''}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    From: {msg.sender}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6">Analyze Messages</h2>
            
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="font-medium text-sm">{cat.name}</span>
                      </div>
                      <p className="text-xs text-gray-400">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyze button */}
              <div>
                <button
                  onClick={analyzeMessages}
                  disabled={analyzing || messages.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing... {progress}%
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze with Claude AI
                    </>
                  )}
                </button>
              </div>

              {/* Progress */}
              {analyzing && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="w-full bg-gray-600 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-400">
                    Processing message {Math.ceil((progress / 100) * messages.length)} of {messages.length}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && statistics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportData('json')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={() => exportData('markdown')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Markdown
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Messages */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-3xl font-bold">{statistics.total_messages}</p>
                    <p className="text-sm text-gray-400">Total Messages</p>
                  </div>
                </div>
              </div>

              {/* GitHub References */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <GitBranch className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-3xl font-bold">{statistics.github_references?.length || 0}</p>
                    <p className="text-sm text-gray-400">GitHub References</p>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <CheckSquare className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-3xl font-bold">{statistics.action_items?.length || 0}</p>
                    <p className="text-sm text-gray-400">Action Items</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="mt-6 bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(statistics.categories || {}).map(([category, count]) => {
                  const percentage = ((count / statistics.total_messages) * 100).toFixed(1);
                  const categoryInfo = categories.find(c => c.id === category);
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <span>{categoryInfo?.icon || '📄'}</span>
                          {category}
                        </span>
                        <span className="text-sm text-gray-400">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="mt-6 bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Priority Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statistics.priorities || {}).map(([priority, count]) => {
                  const percentage = ((count / statistics.total_messages) * 100).toFixed(1);
                  const priorityInfo = priorities.find(p => p.level === priority);
                  return (
                    <div
                      key={priority}
                      className="bg-gray-600/50 rounded-lg p-4 text-center"
                    >
                      <div className="text-3xl mb-2">{priorityInfo?.color || '⚪'}</div>
                      <div className="text-2xl font-bold mb-1">{count}</div>
                      <div className="text-sm text-gray-400">{priority}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && reportMarkdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Generated Report</h2>
              <button
                onClick={() => exportData('markdown')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap text-gray-300">
                {reportMarkdown}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && messages.length === 0 && activeTab !== 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center"
          >
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Messages Loaded</h3>
            <p className="text-gray-400 mb-6">
              Upload messages to start analysis
            </p>
            <button
              onClick={() => setActiveTab('upload')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Go to Upload
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
