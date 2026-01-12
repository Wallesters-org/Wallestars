import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { Activity, CheckCircle2, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function TaskOrchestrationDashboard() {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    activeAgents: 0
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    loadData();
    
    // Socket.io real-time updates
    if (socket) {
      socket.on('task:assigned', handleTaskAssigned);
      socket.on('task:updated', handleTaskUpdated);
      socket.on('task:failed', handleTaskFailed);
      socket.on('task:sla-violation', handleSLAViolation);
      socket.on('agent:overload', handleAgentOverload);
    }

    return () => {
      if (socket) {
        socket.off('task:assigned', handleTaskAssigned);
        socket.off('task:updated', handleTaskUpdated);
        socket.off('task:failed', handleTaskFailed);
        socket.off('task:sla-violation', handleSLAViolation);
        socket.off('agent:overload', handleAgentOverload);
      }
    };
  }, [socket]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [tasksRes, agentsRes, reportRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/agents'),
        fetch('/api/tasks/report/delegation')
      ]);

      const tasksData = await tasksRes.json();
      const agentsData = await agentsRes.json();
      const reportData = await reportRes.json();

      if (tasksData.success) setTasks(tasksData.tasks);
      if (agentsData.success) setAgents(agentsData.agents);
      if (reportData.success) {
        setReport(reportData.report);
        setMetrics({
          totalTasks: reportData.report.summary.totalTasks,
          completedTasks: reportData.report.summary.completed,
          failedTasks: reportData.report.summary.failed,
          activeAgents: agentsData.agents.filter(a => a.status === 'ACTIVE').length
        });
      }
    } catch (error) {
      console.error('Failed to load orchestration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAssigned = ({ task, agent }) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    showNotification(`Task ${task.id} assigned to ${agent.name}`, 'success');
  };

  const handleTaskUpdated = ({ task }) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    if (task.status === 'COMPLETED') {
      showNotification(`Task ${task.id} completed!`, 'success');
      loadData(); // Refresh metrics
    }
  };

  const handleTaskFailed = ({ task, reason }) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    showNotification(`Task ${task.id} failed: ${reason}`, 'error');
  };

  const handleSLAViolation = ({ task }) => {
    showNotification(`SLA violation for task ${task.id}`, 'warning');
  };

  const handleAgentOverload = ({ agent }) => {
    showNotification(`Agent ${agent.id} is overloaded`, 'warning');
  };

  const showNotification = (message, type) => {
    // Simple console notification - can be enhanced with toast library
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const assignTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification(`Task assigned successfully`, 'success');
        loadData();
      }
    } catch (error) {
      console.error('Failed to assign task:', error);
      showNotification('Failed to assign task', 'error');
    }
  };

  const processNextTask = async () => {
    try {
      const response = await fetch('/api/tasks/queue/next', {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        if (data.task) {
          showNotification(`Next task assigned: ${data.task.id}`, 'success');
          loadData();
        } else {
          showNotification('No tasks in queue', 'info');
        }
      }
    } catch (error) {
      console.error('Failed to process next task:', error);
      showNotification('Failed to process next task', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: 'text-green-500',
      IN_PROGRESS: 'text-blue-500',
      PENDING: 'text-yellow-500',
      FAILED: 'text-red-500',
      ASSIGNED: 'text-purple-500'
    };
    return colors[status] || 'text-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      P0: 'bg-red-900 text-red-300',
      P1: 'bg-orange-900 text-orange-300',
      P2: 'bg-yellow-900 text-yellow-300',
      P3: 'bg-blue-900 text-blue-300'
    };
    return colors[priority] || 'bg-gray-900 text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading orchestration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🤖 Task Orchestration & Agent Management
            </h1>
            <p className="text-gray-400">
              Управление и делегиране на задачи със свързване към Antigravity
            </p>
          </div>
          <button
            onClick={processNextTask}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-2"
          >
            <Activity size={20} />
            Process Next Task
          </button>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Activity className="text-sky-500" />}
            label="Total Tasks"
            value={metrics.totalTasks}
            color="sky"
          />
          <MetricCard
            icon={<CheckCircle2 className="text-green-500" />}
            label="Completed"
            value={metrics.completedTasks}
            color="green"
          />
          <MetricCard
            icon={<AlertTriangle className="text-red-500" />}
            label="Failed"
            value={metrics.failedTasks}
            color="red"
          />
          <MetricCard
            icon={<Users className="text-purple-500" />}
            label="Active Agents"
            value={metrics.activeAgents}
            color="purple"
          />
        </div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-sky-500" />
            Tasks
          </h2>
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onAssign={() => assignTask(task.id)}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        </motion.div>

        {/* Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-purple-500" />
            Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        {report && report.recentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              Recent Activity
            </h2>
            <div className="space-y-2">
              {report.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium">{activity.name}</p>
                    <p className="text-gray-400 text-sm">
                      {activity.id} - Agent: {activity.agent}
                    </p>
                  </div>
                  <span className={`${getStatusColor(activity.status)} font-semibold`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 rounded-xl p-6 flex items-center gap-4"
    >
      <div className={`p-3 bg-${color}-900 rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onAssign, getStatusColor, getPriorityColor }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-700 rounded-lg p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`font-semibold ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">{task.name}</h3>
          <p className="text-gray-400 text-sm">{task.description}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">ETA: {task.eta}</p>
          {task.agent && (
            <p className="text-sky-400 text-sm">Agent: {task.agent}</p>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
        <div
          className="bg-sky-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${task.progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">{task.progress}% Complete</span>
        {!task.agent && task.status === 'PENDING' && (
          <button
            onClick={onAssign}
            className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded"
          >
            Assign
          </button>
        )}
      </div>
    </motion.div>
  );
}

function AgentCard({ agent }) {
  const statusColors = {
    ACTIVE: 'text-green-500',
    IDLE: 'text-yellow-500',
    OFFLINE: 'text-gray-500'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-700 rounded-lg p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-bold">{agent.name}</h3>
          <p className="text-gray-400 text-sm">{agent.id}</p>
        </div>
        <span className={`font-semibold ${statusColors[agent.status]}`}>
          {agent.status}
        </span>
      </div>
      
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Load:</span>
          <span className="text-white">
            {agent.currentTasks.length}/{agent.maxConcurrentTasks}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Reliability:</span>
          <span className="text-sky-400">{(agent.reliability * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      {agent.capabilities && agent.capabilities.length > 0 && (
        <div className="mt-3">
          <p className="text-gray-400 text-xs mb-1">Capabilities:</p>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map(cap => (
              <span
                key={cap}
                className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
