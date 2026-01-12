import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Header({ toggleSidebar, sidebarOpen }) {
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    network: 'Connected'
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate system stats (replace with real data)
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 40,
        network: connected ? 'Connected' : 'Disconnected'
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [connected]);

  return (
    <header className="glass-effect border-b border-white/10 sticky top-0 z-40 backdrop-blur-2xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 border border-transparent hover:border-white/20"
            >
              <Menu className="w-5 h-5 text-primary-400" />
            </motion.button>

            <div>
              <h2 className="text-xl font-bold text-gradient-primary">
                {time.toLocaleTimeString()}
              </h2>
              <p className="text-sm text-dark-400">
                {time.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right section - System stats - Enhanced */}
          <div className="flex items-center gap-3">
            {/* CPU */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all duration-300"
            >
              <Cpu className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-dark-400 font-medium">CPU</p>
                <p className="text-sm font-bold text-gradient-cool">{systemStats.cpu}%</p>
              </div>
            </motion.div>

            {/* Memory */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-xl border border-white/10 hover:border-accent-violet/30 transition-all duration-300"
            >
              <HardDrive className="w-4 h-4 text-accent-violet" />
              <div>
                <p className="text-xs text-dark-400 font-medium">Memory</p>
                <p className="text-sm font-bold text-gradient-vibrant">{systemStats.memory}%</p>
              </div>
            </motion.div>

            {/* Connection status */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className={`flex items-center gap-2 glass-effect px-4 py-2 rounded-xl border transition-all duration-300 ${
                connected 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="relative">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                    ></motion.div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full pulse-ring"></div>
                  </>
                ) : (
                  <Wifi className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-dark-400 font-medium">Status</p>
                <p className={`text-sm font-bold ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                  {systemStats.network}
                </p>
              </div>
            </motion.div>

            {/* Activity indicator */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 glass-effect rounded-xl border border-white/10 hover:border-primary-500/30 transition-all duration-300"
            >
              <Activity className="w-5 h-5 text-primary-400" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
