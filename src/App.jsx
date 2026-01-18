import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ClaudeChat from './pages/ClaudeChat';
import ComputerControl from './pages/ComputerControl';
import AndroidControl from './pages/AndroidControl';
import Settings from './pages/Settings';
import PromptGenerator from './pages/PromptGenerator';
import SmartScan from './pages/SmartScan';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = {
    dashboard: <Dashboard />,
    chat: <ClaudeChat />,
    computer: <ComputerControl />,
    android: <AndroidControl />,
    smartscan: <SmartScan />,
    promptgen: <PromptGenerator />,
    settings: <Settings />
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 animate-gradient relative overflow-hidden">
        {/* Enhanced Background effects with more vibrant colors */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Primary glow orbs */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-accent-violet/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent-purple/15 rounded-full mix-blend-screen filter blur-3xl animate-float animation-delay-4000"></div>
          
          {/* Secondary accent glows */}
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-cyan/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent-pink/10 rounded-full mix-blend-screen filter blur-3xl animate-float animation-delay-3000"></div>
          
          {/* Grid overlay for depth */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        </div>

        <div className="relative flex">
          {/* Sidebar */}
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />

          {/* Main content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <Header
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />

            <main className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {pages[activePage]}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;
