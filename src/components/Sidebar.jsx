import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Smartphone,
  Settings,
  Zap,
  Sparkles,
  ScanLine
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', name: 'Claude Chat', icon: MessageSquare },
  { id: 'computer', name: 'Computer Use', icon: Monitor },
  { id: 'android', name: 'Android Control', icon: Smartphone },
  { id: 'smartscan', name: 'Smart Scan', icon: ScanLine },
  { id: 'promptgen', name: 'Prompt Generator', icon: Sparkles },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, isOpen }) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? '16rem' : '5rem',
      }}
      className="fixed left-0 top-0 h-screen glass-effect border-r border-white/10 z-50 backdrop-blur-2xl"
    >
      <div className="p-6">
        {/* Logo - Enhanced */}
        <div className="flex items-center gap-3 mb-10">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-500 via-accent-violet to-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 relative"
          >
            <Zap className="w-6 h-6 text-white" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl blur-lg opacity-50 -z-10"></div>
          </motion.div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-xl font-bold text-gradient-primary">
                Wallestars
              </h1>
              <p className="text-xs text-dark-400">Control Center</p>
            </motion.div>
          )}
        </div>

        {/* Menu Items - Enhanced */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-300 relative overflow-hidden group
                  ${isActive
                    ? 'bg-gradient-to-r from-primary-500 via-accent-violet to-accent-purple text-white shadow-lg shadow-primary-500/40 border border-white/20'
                    : 'text-dark-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
                  }
                `}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-violet to-accent-purple"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                    {/* Shimmer effect for active tab */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  </>
                )}

                {/* Hover glow effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}

                <Icon className="w-5 h-5 relative z-10" />

                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 font-semibold"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Status indicator - Enhanced */}
      <div className="absolute bottom-6 left-6 right-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
              ></motion.div>
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full pulse-ring"></div>
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-emerald-400"
              >
                System Online
              </motion.span>
            )}
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
