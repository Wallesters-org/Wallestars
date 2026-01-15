import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, User, Loader, Hash, Plus, Settings, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function SlackChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [channel, setChannel] = useState('');
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const messagesEndRef = useRef(null);

  // Load status and messages on mount
  useEffect(() => {
    checkStatus();
    loadMessages();
    loadChannels();
  }, []);

  // Set up WebSocket listener for real-time messages
  useEffect(() => {
    const handleIncomingMessage = (event) => {
      if (event.detail) {
        setMessages(prev => [...prev, event.detail]);
      }
    };

    window.addEventListener('slack:message-received', handleIncomingMessage);
    return () => window.removeEventListener('slack:message-received', handleIncomingMessage);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/slack/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check Slack status:', error);
      setStatus({ configured: false, error: error.message });
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/slack/messages?limit=50');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/slack/channels');
      const data = await response.json();
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const addChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const response = await fetch('/api/slack/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName })
      });

      if (response.ok) {
        await loadChannels();
        setNewChannelName('');
        setShowAddChannel(false);
      }
    } catch (error) {
      console.error('Failed to add channel:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          channel: channel || undefined,
          username: 'Wallestars Bot'
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, data.sentMessage]);
        setInput('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: `Error: ${error.message}`,
        direction: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Slack Chat</h1>
            <p className="text-dark-400 text-sm">Send messages to your Slack workspace</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              status?.configured
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {status?.configured ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Not configured
                </>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                checkStatus();
                loadMessages();
              }}
              className="btn-secondary p-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Configuration warning */}
        {!status?.configured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <p className="text-yellow-400 text-sm">
              <strong>Setup required:</strong> Add SLACK_WEBHOOK_URL to your .env file to send messages.
              Get a webhook URL from your Slack workspace settings under "Incoming Webhooks".
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Channel selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-4"
      >
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-dark-400" />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Default Channel (from webhook)</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.name}>#{ch.name}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddChannel(!showAddChannel)}
            className="btn-secondary p-2"
            title="Add Channel"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Add channel form */}
        <AnimatePresence>
          {showAddChannel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-dark-700 flex gap-2"
            >
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Channel name (e.g., general)"
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addChannel()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addChannel}
                className="btn-primary px-4"
              >
                Add
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 card overflow-y-auto mb-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-500">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Send a message to get started</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex gap-3 ${
                  message.direction === 'outgoing' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.direction === 'outgoing'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : message.direction === 'error'
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  {message.direction === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message content */}
                <div className={`flex-1 ${
                  message.direction === 'outgoing' ? 'items-end' : ''
                } flex flex-col`}>
                  <div className={`glass-effect p-4 rounded-lg max-w-2xl ${
                    message.direction === 'outgoing'
                      ? 'bg-purple-500/20'
                      : message.direction === 'error'
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-blue-500/20'
                  }`}>
                    {message.username && (
                      <p className="text-xs text-dark-400 mb-1">{message.username}</p>
                    )}
                    {message.channel && message.channel !== 'default' && (
                      <p className="text-xs text-primary-400 mb-1">#{message.channel}</p>
                    )}
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                  <span className="text-xs text-dark-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-end"
          >
            <div className="glass-effect p-4 rounded-lg bg-purple-500/20">
              <div className="flex gap-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to send to Slack... (Press Enter to send)"
            className="input-field flex-1 resize-none h-20"
            disabled={isLoading || !status?.configured}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !status?.configured}
            className="btn-primary h-20 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
