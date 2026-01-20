import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api/orchestration';

export default function OrchestrationFarm() {
  const [platforms, setPlatforms] = useState([]);
  const [agents, setAgents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState('platforms');
  const [eventSource, setEventSource] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    connectToEventStream();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [platformsRes, agentsRes, batchesRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE}/platforms`),
        fetch(`${API_BASE}/agents`),
        fetch(`${API_BASE}/batches`),
        fetch(`${API_BASE}/metrics`)
      ]);

      const [platformsData, agentsData, batchesData, metricsData] = await Promise.all([
        platformsRes.json(),
        agentsRes.json(),
        batchesRes.json(),
        metricsRes.json()
      ]);

      if (platformsData.success) setPlatforms(platformsData.platforms);
      if (agentsData.success) setAgents(agentsData.agents);
      if (batchesData.success) setBatches(batchesData.batches);
      if (metricsData.success) setMetrics(metricsData.metrics);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToEventStream = () => {
    const es = new EventSource(`${API_BASE}/events`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'heartbeat') {
        setLiveEvents(prev => [data, ...prev].slice(0, 50));

        // Update state based on event type
        if (data.type === 'batch:progress' || data.type === 'batch:completed') {
          fetchData();
        }
      }
    };

    es.onerror = () => {
      console.error('EventSource error, reconnecting...');
      es.close();
      setTimeout(connectToEventStream, 5000);
    };

    setEventSource(es);
  };

  const togglePlatform = (slug) => {
    setSelectedPlatforms(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const selectAll = () => {
    setSelectedPlatforms(platforms.map(p => p.slug));
  };

  const selectNone = () => {
    setSelectedPlatforms([]);
  };

  const selectByCategory = (category) => {
    const categoryPlatforms = platforms
      .filter(p => p.category === category)
      .map(p => p.slug);
    setSelectedPlatforms(prev => [...new Set([...prev, ...categoryPlatforms])]);
  };

  const startOrchestration = async () => {
    if (selectedPlatforms.length === 0) return;

    setIsStarting(true);
    try {
      const response = await fetch(`${API_BASE}/quick-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: selectedPlatforms })
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        setSelectedPlatforms([]);
      }
    } catch (error) {
      console.error('Error starting orchestration:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'AI Assistant': '🤖',
      'AI Development': '💻',
      'Automation': '⚡',
      'Database/Backend': '🗄️',
      'Deployment': '🚀',
      'Communication': '💬',
      'Productivity': '📝',
      'Project Management': '📊',
      'Monitoring': '📈',
      'Security': '🔐'
    };
    return icons[category] || '📦';
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'bg-gray-500',
      busy: 'bg-green-500',
      error: 'bg-red-500',
      offline: 'bg-gray-700',
      pending: 'bg-yellow-500',
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const categories = [...new Set(platforms.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          AI Agents Orchestration Farm
        </h1>
        <p className="text-gray-400">
          Automate free trial platform registration and management
        </p>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
            <div className="text-3xl font-bold text-white">{metrics.totalTasksProcessed}</div>
            <div className="text-gray-400 text-sm">Tasks Processed</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">{metrics.successfulTasks}</div>
            <div className="text-gray-400 text-sm">Successful</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
            <div className="text-3xl font-bold text-red-400">{metrics.failedTasks}</div>
            <div className="text-gray-400 text-sm">Failed</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{metrics.activeAgents}</div>
            <div className="text-gray-400 text-sm">Active Agents</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['platforms', 'agents', 'batches', 'events'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-gray-400 mr-2">Quick Select:</span>
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
            >
              All
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
            >
              None
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => selectByCategory(category)}
                className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {platforms.map(platform => (
              <motion.div
                key={platform.slug}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => togglePlatform(platform.slug)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  selectedPlatforms.includes(platform.slug)
                    ? 'bg-purple-600/30 border-purple-500'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{getCategoryIcon(platform.category)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    platform.trialDays === 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {platform.trialDays === 0 ? 'Free Tier' : `${platform.trialDays}d Trial`}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-1">{platform.name}</h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">{platform.description}</p>
                <div className="flex flex-wrap gap-1">
                  {platform.features?.slice(0, 3).map((feature, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Start Button */}
          <div className="fixed bottom-6 right-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startOrchestration}
              disabled={selectedPlatforms.length === 0 || isStarting}
              className={`px-6 py-4 rounded-xl font-bold text-lg shadow-2xl ${
                selectedPlatforms.length > 0
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Starting...
                </span>
              ) : (
                `Start Orchestration (${selectedPlatforms.length} platforms)`
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{agent.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Type:</span>
                  <span className="text-white">{agent.type}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Performance:</span>
                  <span className="text-white">{agent.performanceScore}%</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Completed:</span>
                  <span className="text-green-400">{agent.completedTasks}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Failed:</span>
                  <span className="text-red-400">{agent.failedTasks}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Current Tasks:</span>
                  <span className="text-blue-400">{agent.currentTasks?.length || 0}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {agent.capabilities?.map((cap, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {batches.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No orchestration batches yet. Select platforms and start orchestration.
            </div>
          ) : (
            batches.map(batch => (
              <div
                key={batch.id}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{batch.name || batch.id}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {batch.progress?.completed || 0} / {batch.progress?.total || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{
                        width: `${batch.progress?.total
                          ? (batch.progress.completed / batch.progress.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {batch.progress?.completed || 0}
                    </div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {batch.progress?.inProgress || 0}
                    </div>
                    <div className="text-xs text-gray-400">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {batch.progress?.failed || 0}
                    </div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold">Live Events</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-gray-400 text-sm">Connected</span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {liveEvents.map((event, index) => (
                <motion.div
                  key={`${event.type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-2 border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      event.type.includes('completed') ? 'bg-green-500' :
                      event.type.includes('failed') ? 'bg-red-500' :
                      event.type.includes('started') ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></span>
                    <span className="text-white font-mono text-sm">{event.type}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-gray-400 text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(event, null, 2).slice(0, 200)}
                  </pre>
                </motion.div>
              ))}
            </AnimatePresence>
            {liveEvents.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                Waiting for events...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
