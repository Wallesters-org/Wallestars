import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Link as LinkIcon,
  Upload,
  Search,
  Download,
  QrCode,
  CheckCircle,
  AlertCircle,
  Sparkles,
  GitBranch,
  Play,
  RefreshCw
} from 'lucide-react';

export default function AnalysisApp() {
  const [phase, setPhase] = useState('input'); // input, analyzing, interactive, export
  const [inputType, setInputType] = useState('url'); // url, file, text
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);

  const inputTypes = [
    { id: 'url', name: 'URL/Link', icon: LinkIcon },
    { id: 'file', name: 'File Upload', icon: Upload },
    { id: 'text', name: 'Text Input', icon: FileText }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputValue(event.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const analyzeContent = async () => {
    setLoading(true);
    setPhase('analyzing');

    try {
      // Simulate analysis - in production this would call backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis result
      const mockData = {
        title: 'Analysis Results',
        summary: 'Content analyzed successfully',
        keyPoints: [
          'Key decision point 1: Project structure and architecture',
          'Key decision point 2: Technology stack selection',
          'Key decision point 3: Deployment strategy'
        ],
        decisions: [
          {
            id: 'decision1',
            question: 'What architecture pattern should be used?',
            options: ['Monolithic', 'Microservices', 'Serverless', 'Hybrid']
          },
          {
            id: 'decision2',
            question: 'Which frontend framework is preferred?',
            options: ['React', 'Vue', 'Angular', 'Svelte']
          },
          {
            id: 'decision3',
            question: 'What deployment approach?',
            options: ['Cloud (AWS/Azure)', 'On-Premise', 'Hybrid', 'Edge Computing']
          }
        ],
        metadata: {
          source: inputValue,
          analyzedAt: new Date().toISOString(),
          type: inputType
        }
      };

      setAnalysisData(mockData);
      setPhase('interactive');
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing content. Please try again.');
      setPhase('input');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (decisionId, option) => {
    setDecisions(prev => ({
      ...prev,
      [decisionId]: option
    }));
  };

  const generateExport = (format) => {
    const exportData = {
      analysis: analysisData,
      decisions: decisions,
      exportedAt: new Date().toISOString()
    };

    let content, filename, mimeType;

    switch (format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = 'analysis-export.json';
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = generateMarkdown(exportData);
        filename = 'analysis-export.md';
        mimeType = 'text/markdown';
        break;
      case 'yaml':
        content = generateYAML(exportData);
        filename = 'analysis-export.yaml';
        mimeType = 'text/yaml';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdown = (data) => {
    return `# Analysis Report

## Summary
${data.analysis.summary}

## Key Points
${data.analysis.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

## Decisions Made
${Object.entries(data.decisions).map(([key, value]) => {
  const decision = data.analysis.decisions.find(d => d.id === key);
  return `### ${decision?.question}\n**Selected:** ${value}`;
}).join('\n\n')}

## Metadata
- Exported: ${data.exportedAt}
- Source: ${data.analysis.metadata.source}
`;
  };

  const generateYAML = (data) => {
    return `analysis:
  title: "${data.analysis.title}"
  summary: "${data.analysis.summary}"
  keyPoints:
${data.analysis.keyPoints.map(point => `    - "${point}"`).join('\n')}
decisions:
${Object.entries(data.decisions).map(([key, value]) => `  ${key}: "${value}"`).join('\n')}
metadata:
  exportedAt: "${data.exportedAt}"
  source: "${data.analysis.metadata.source}"
`;
  };

  const generateQRCode = async () => {
    // Generate a mock URL for the analysis
    const analysisUrl = `https://wallestars.app/analysis/${Date.now()}`;
    
    // In production, this would use a real QR code library
    setQrData(analysisUrl);
    alert(`QR Code generated for: ${analysisUrl}\n\nIn production, this would display an actual QR code.`);
  };

  const resetApp = () => {
    setPhase('input');
    setInputValue('');
    setFile(null);
    setAnalysisData(null);
    setDecisions({});
    setQrData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Analysis & Application
            </h1>
            <p className="text-dark-400 mt-2">
              Analyze content, make decisions, and export results
            </p>
          </div>
          <motion.div
            animate={{ rotate: phase === 'analyzing' ? 360 : 0 }}
            transition={{ duration: 2, repeat: phase === 'analyzing' ? Infinity : 0 }}
            className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Phase Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          {['input', 'analyzing', 'interactive', 'export'].map((p, index) => (
            <div key={p} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${phase === p ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' :
                  ['input', 'analyzing', 'interactive'].indexOf(phase) > ['input', 'analyzing', 'interactive'].indexOf(p)
                    ? 'bg-green-500 text-white' : 'bg-dark-700 text-dark-400'}
              `}>
                {['input', 'analyzing', 'interactive'].indexOf(phase) > ['input', 'analyzing', 'interactive'].indexOf(p) ?
                  <CheckCircle className="w-5 h-5" /> :
                  <span>{index + 1}</span>
                }
              </div>
              <span className="ml-2 text-sm capitalize text-dark-300">{p}</span>
              {index < 3 && <div className="w-12 h-0.5 bg-dark-700 mx-4" />}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Input Phase */}
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Input Type Selection */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Select Input Type</h2>
              <div className="grid grid-cols-3 gap-4">
                {inputTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInputType(type.id)}
                      className={`
                        p-6 rounded-lg flex flex-col items-center gap-3
                        transition-all duration-200
                        ${inputType === type.id
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'glass-effect text-dark-300 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-8 h-8" />
                      <span className="font-medium">{type.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Input Field */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Provide Content</h2>
              
              {inputType === 'url' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter URL (e.g., https://claude.ai/share/...)"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-sm text-dark-400">
                    Supported: Claude conversations, GitHub issues, Markdown files, etc.
                  </p>
                </div>
              )}

              {inputType === 'file' && (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <Upload className="w-8 h-8 text-dark-400 mb-2" />
                    <span className="text-dark-400">Click to upload file</span>
                    {file && <span className="text-primary-500 mt-2">{file.name}</span>}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".md,.txt,.json,.yaml,.yml"
                    />
                  </label>
                </div>
              )}

              {inputType === 'text' && (
                <div className="space-y-4">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Paste your content here..."
                    rows={10}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeContent}
                disabled={!inputValue}
                className={`
                  mt-4 w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2
                  ${inputValue
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg'
                    : 'bg-dark-700 text-dark-400 cursor-not-allowed'
                  }
                `}
              >
                <Play className="w-5 h-5" />
                Start Analysis
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Analyzing Phase */}
        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
          >
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Content</h2>
              <p className="text-dark-400">Processing and extracting key information...</p>
            </div>
          </motion.div>
        )}

        {/* Interactive Decision Phase */}
        {phase === 'interactive' && analysisData && (
          <motion.div
            key="interactive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Analysis Summary */}
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-4">{analysisData.title}</h2>
              <p className="text-dark-300 mb-6">{analysisData.summary}</p>
              
              <h3 className="text-lg font-semibold text-white mb-3">Key Points</h3>
              <ul className="space-y-2">
                {analysisData.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-dark-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decision Points */}
            {analysisData.decisions.map((decision, index) => (
              <div key={decision.id} className="card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{decision.question}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {decision.options.map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDecision(decision.id, option)}
                      className={`
                        p-4 rounded-lg font-medium transition-all
                        ${decisions[decision.id] === option
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'glass-effect text-dark-300 hover:text-white'
                        }
                      `}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            {/* Continue to Export */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase('export')}
              disabled={Object.keys(decisions).length < analysisData.decisions.length}
              className={`
                w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2
                ${Object.keys(decisions).length === analysisData.decisions.length
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                  : 'bg-dark-700 text-dark-400 cursor-not-allowed'
                }
              `}
            >
              <CheckCircle className="w-5 h-5" />
              Complete & Export
            </motion.button>
          </motion.div>
        )}

        {/* Export Phase */}
        {phase === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Success Message */}
            <div className="card bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Analysis Complete!</h2>
                  <p className="text-dark-300">Your analysis and decisions have been recorded.</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Export Results</h3>
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateExport('json')}
                  className="p-6 glass-effect rounded-lg flex flex-col items-center gap-3 hover:bg-white/5"
                >
                  <Download className="w-8 h-8 text-primary-500" />
                  <span className="font-medium text-white">JSON</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateExport('markdown')}
                  className="p-6 glass-effect rounded-lg flex flex-col items-center gap-3 hover:bg-white/5"
                >
                  <Download className="w-8 h-8 text-primary-500" />
                  <span className="font-medium text-white">Markdown</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateExport('yaml')}
                  className="p-6 glass-effect rounded-lg flex flex-col items-center gap-3 hover:bg-white/5"
                >
                  <Download className="w-8 h-8 text-primary-500" />
                  <span className="font-medium text-white">YAML</span>
                </motion.button>
              </div>
            </div>

            {/* QR Code Generation */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Share Results</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateQRCode}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                Generate QR Code
              </motion.button>
              {qrData && (
                <p className="mt-4 text-sm text-dark-400 text-center">
                  QR Code URL: {qrData}
                </p>
              )}
            </div>

            {/* Start New Analysis */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetApp}
              className="w-full py-3 glass-effect rounded-lg font-semibold flex items-center justify-center gap-2 text-white hover:bg-white/5"
            >
              <RefreshCw className="w-5 h-5" />
              Start New Analysis
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
