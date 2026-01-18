import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Bot,
  Cloud,
  MessageSquare,
  Wrench,
  Globe,
  Activity,
  AlertTriangle,
  ChevronRight,
  Search,
  Filter,
  Settings,
  Loader2,
  Rocket
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// Platform type icons
const typeIcons = {
  ai_agent: Bot,
  automation: Zap,
  cloud: Cloud,
  dev_tools: Wrench,
  communication: MessageSquare
};

// Platform type colors
const typeColors = {
  ai_agent: 'from-purple-500 to-pink-500',
  automation: 'from-blue-500 to-cyan-500',
  cloud: 'from-emerald-500 to-teal-500',
  dev_tools: 'from-orange-500 to-amber-500',
  communication: 'from-indigo-500 to-violet-500'
};

export default function Orchestration() {
  const { connected } = useSocket();
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [email, setEmail] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available platforms
  const fetchPlatforms = useCallback(async () => {
    try {
      const response = await fetch('/api/orchestration/platforms');
      const data = await response.json();
      if (data.success) {
        setPlatforms(data.platforms);
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    }
  }, []);

  // Fetch orchestration status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/orchestration/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data);
        setIsRunning(data.isRunning);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlatforms(), fetchStatus()]);
      setIsLoading(false);
    };
    init();

    // Poll for status updates
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchPlatforms, fetchStatus]);

  // Start all platforms
  const handleStartAll = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      setIsRunning(true);
      const response = await fetch('/api/orchestration/start-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
          userData: { email },
          maxConcurrent: 5
        })
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to start orchestration:', error);
      setIsRunning(false);
    }
  };

  // Cancel all tasks
  const handleCancelAll = async () => {
    try {
      const response = await fetch('/api/orchestration/cancel-all', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  };

  // Reset session
  const handleReset = async () => {
    try {
      const response = await fetch('/api/orchestration/reset', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setStatus(null);
        setIsRunning(false);
        setSelectedPlatforms([]);
      }
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  };

  // Toggle platform selection
  const togglePlatform = (platformName) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformName)
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  };

  // Select all platforms
  const selectAll = () => {
    setSelectedPlatforms(filteredPlatforms.map(p => p.name));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPlatforms([]);
  };

  // Filter platforms
  const filteredPlatforms = platforms.filter(platform => {
    const matchesFilter = filter === 'all' || platform.type === filter;
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get unique types
  const types = ['all', ...new Set(platforms.map(p => p.type))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            AI Agents Orchestration Farm
          </h1>
          <p className="text-gray-400 mt-1">
            Automate free trial platform registration and start all agents at once
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-sm font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{platforms.length}</p>
              <p className="text-xs text-gray-400">Available Platforms</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{selectedPlatforms.length}</p>
              <p className="text-xs text-gray-400">Selected</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {status?.completedTasks?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRunning ? 'bg-amber-500/20' : 'bg-gray-500/20'}`}>
              {isRunning ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {status?.pendingTasks?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-400" />
          Control Panel
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Registration Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Selection Controls */}
          <div className="flex items-end gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Clear
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            {!isRunning ? (
              <button
                onClick={handleStartAll}
                disabled={selectedPlatforms.length === 0 && platforms.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
              >
                <Play className="w-4 h-4" />
                Start All
              </button>
            ) : (
              <button
                onClick={handleCancelAll}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
              >
                <Pause className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              onClick={handleReset}
              className="p-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms..."
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === type
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredPlatforms.map((platform, index) => {
            const Icon = typeIcons[platform.type] || Globe;
            const isSelected = selectedPlatforms.includes(platform.name);
            const taskStatus = status?.completedTasks?.find(t => t.platform === platform.name)
              || status?.failedTasks?.find(t => t.platform === platform.name)
              || status?.pendingTasks?.find(t => t.platform === platform.name)
              || status?.activeTasks?.find(t => t.platform === platform.name);

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => togglePlatform(platform.name)}
                className={`relative bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-gray-700/50 hover:border-gray-600'
                }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-purple-500' : 'bg-gray-700'
                }`}>
                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>

                {/* Status Badge */}
                {taskStatus && (
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                    taskStatus.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    taskStatus.status === 'failed' || taskStatus.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    taskStatus.status === 'running' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {taskStatus.status}
                  </div>
                )}

                {/* Platform Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[platform.type] || 'from-gray-500 to-gray-600'} p-0.5 mb-3 ${taskStatus ? 'mt-6' : ''}`}>
                  <div className="w-full h-full bg-gray-900 rounded-[10px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Platform Info */}
                <h3 className="font-semibold text-white mb-1">{platform.name}</h3>
                <p className="text-xs text-gray-500 mb-2 capitalize">
                  {platform.type.replace('_', ' ')}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {platform.capabilities?.slice(0, 3).map(cap => (
                    <span
                      key={cap}
                      className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full"
                    >
                      {cap.replace('_', ' ')}
                    </span>
                  ))}
                  {platform.capabilities?.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-500 rounded-full">
                      +{platform.capabilities.length - 3}
                    </span>
                  )}
                </div>

                {/* Trial Info */}
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {platform.trialDays > 0 ? `${platform.trialDays} day trial` : 'Free tier'}
                  </span>
                  {platform.requiresCreditCard && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      CC Required
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Results Section */}
      {status && (status.completedTasks?.length > 0 || status.failedTasks?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Results
          </h2>

          <div className="space-y-3">
            {/* Completed */}
            {status.completedTasks?.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-medium">{task.platform}</span>
                </div>
                <span className="text-emerald-400 text-sm">Completed</span>
              </div>
            ))}

            {/* Failed */}
            {status.failedTasks?.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="text-white font-medium">{task.platform}</span>
                    {task.error && (
                      <p className="text-xs text-red-400">{task.error}</p>
                    )}
                  </div>
                </div>
                <span className="text-red-400 text-sm">Failed</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
