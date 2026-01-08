import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Eye, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailPreview() {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'Wallestars System Update',
    title: 'Wallestars System Update',
    content: 'Your Wallestars Control Center has new updates available.',
    changes: [
      'Email preview functionality added',
      'VPS deployment script created',
      'System monitoring enhanced'
    ]
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangesChange = (index, value) => {
    const newChanges = [...emailData.changes];
    newChanges[index] = value;
    setEmailData(prev => ({
      ...prev,
      changes: newChanges
    }));
  };

  const addChange = () => {
    setEmailData(prev => ({
      ...prev,
      changes: [...prev.changes, '']
    }));
  };

  const removeChange = (index) => {
    setEmailData(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index)
    }));
  };

  const handlePreview = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: emailData.title,
          content: emailData.content,
          changes: emailData.changes.filter(c => c.trim())
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.preview);
        setMessage({ type: 'success', text: 'Preview generated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate preview' });
      }
    } catch (error) {
      console.error('Preview error:', error);
      setMessage({ type: 'error', text: 'Failed to generate preview' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!emailData.to.trim()) {
      setMessage({ type: 'error', text: 'Please enter recipient email address' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          title: emailData.title,
          content: emailData.content,
          changes: emailData.changes.filter(c => c.trim())
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.previewUrl
            ? `Email sent in test mode! Preview: ${data.previewUrl}`
            : 'Email sent successfully!'
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send email' });
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessage({ type: 'error', text: 'Failed to send email' });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/system-summary');
      const data = await response.json();

      if (data.title) {
        setEmailData(prev => ({
          ...prev,
          title: data.title,
          content: data.content,
          changes: data.changes || []
        }));
        setMessage({ type: 'success', text: 'System summary loaded!' });
      }
    } catch (error) {
      console.error('Load summary error:', error);
      setMessage({ type: 'error', text: 'Failed to load system summary' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center gap-3">
          <Mail className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Email Preview</h1>
            <p className="text-blue-100">Create and preview email notifications</p>
          </div>
        </div>
      </motion.div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Email Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="recipient@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={emailData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={emailData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Email content..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Changes List
                </label>
                <button
                  onClick={addChange}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  + Add Change
                </button>
              </div>
              <div className="space-y-2">
                {emailData.changes.map((change, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={change}
                      onChange={(e) => handleChangesChange(index, e.target.value)}
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Change ${index + 1}`}
                    />
                    <button
                      onClick={() => removeChange(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadSystemSummary}
                disabled={loading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load System Summary
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>

          {preview ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <iframe
                srcDoc={preview}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[600px] bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Click "Preview" to see your email</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
