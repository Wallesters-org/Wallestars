import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Upload,
  Camera,
  Trash2,
  Eye,
  Download,
  Loader,
  AlertCircle,
  CheckCircle,
  ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRScanner() {
  const [scans, setScans] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Load scans from localStorage on mount
  useEffect(() => {
    const savedScans = localStorage.getItem('qr_scans');
    if (savedScans) {
      try {
        setScans(JSON.parse(savedScans));
      } catch (e) {
        console.error('Failed to load scans from localStorage:', e);
      }
    }
  }, []);

  // Save scans to localStorage whenever they change
  useEffect(() => {
    if (scans.length > 0) {
      try {
        // Check localStorage size and warn if getting full
        const scanData = JSON.stringify(scans);
        const sizeInMB = new Blob([scanData]).size / (1024 * 1024);
        
        if (sizeInMB > 4) {
          console.warn('localStorage approaching size limit. Consider deleting old scans.');
        }
        
        localStorage.setItem('qr_scans', scanData);
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          showError('Storage limit reached. Please delete some scans.');
          console.error('localStorage quota exceeded:', e);
        }
      }
    }
  }, [scans]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // File size limit: 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(file);
      
      // Analyze with Claude AI
      setAnalyzing(true);
      const analysis = await analyzeImage(base64, file.name);
      
      // Generate QR code data
      const qrData = JSON.stringify({
        filename: file.name,
        timestamp: new Date().toISOString(),
        analysis: analysis.substring(0, 100) // Truncate for QR
      });

      const newScan = {
        id: Date.now(),
        filename: file.name,
        image: base64,
        analysis: analysis,
        qrData: qrData,
        timestamp: new Date().toISOString()
      };

      setScans(prev => [newScan, ...prev]);
      showSuccess('Image analyzed successfully!');
    } catch (err) {
      showError(err.message || 'Failed to analyze image');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const analyzeImage = async (base64Image, filename) => {
    try {
      // Use environment variable or default to localhost
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/claude/vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          prompt: `Analyze this image (${filename}) and provide a detailed description. Include any text, objects, people, colors, and context you can identify.`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      return data.analysis || 'No analysis available';
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to connect to AI service. Make sure the server is running.');
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const deleteScan = (id) => {
    setScans(prev => prev.filter(scan => scan.id !== id));
    if (selectedScan?.id === id) {
      setSelectedScan(null);
    }
    showSuccess('Scan deleted successfully');
  };

  const viewScan = (scan) => {
    setSelectedScan(scan);
  };

  const downloadQR = (scan) => {
    const svg = document.getElementById(`qr-${scan.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${scan.filename}`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">QR Scanner & AI Analysis</h1>
              <p className="text-dark-400 text-sm">Upload images for AI analysis and QR code generation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-dark-400">Total Scans</p>
            <p className="text-2xl font-bold text-purple-400">{scans.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 glass-effect border border-red-500/30 p-4 rounded-lg max-w-md"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 glass-effect border border-green-500/30 p-4 rounded-lg max-w-md"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-400">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-dark-600 hover:border-purple-500/50'}
            ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploading ? (
            <div className="space-y-4">
              <Loader className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
              <div>
                <p className="text-lg font-semibold">
                  {analyzing ? 'Analyzing with AI...' : 'Uploading...'}
                </p>
                <p className="text-sm text-dark-400 mt-2">Please wait while we process your image</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-purple-400 mx-auto" />
              <div>
                <p className="text-lg font-semibold mb-2">
                  Drop an image here or click to upload
                </p>
                <p className="text-sm text-dark-400">
                  Supports JPG, PNG, GIF, WebP • Max 10MB
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary inline-flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="w-5 h-5" />
                Choose File
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Scans Grid */}
      {scans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Recent Scans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="card group hover:border-purple-500/50 transition-all"
              >
                {/* Image Preview */}
                <div className="relative aspect-video bg-dark-800 rounded-lg overflow-hidden mb-3">
                  <img
                    src={scan.image}
                    alt={scan.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold truncate">{scan.filename}</h3>
                  <p className="text-xs text-dark-400">
                    {new Date(scan.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-dark-300 line-clamp-2">
                    {scan.analysis}
                  </p>
                </div>

                {/* QR Code (hidden, for download) */}
                <div className="hidden">
                  <QRCodeSVG
                    id={`qr-${scan.id}`}
                    value={scan.qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => viewScan(scan)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadQR(scan)}
                    className="btn-secondary flex items-center justify-center gap-2 text-sm px-3"
                  >
                    <QrCode className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteScan(scan.id)}
                    className="btn-secondary flex items-center justify-center gap-2 text-sm px-3 hover:text-red-400 hover:border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScan(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedScan.filename}</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedScan(null)}
                    className="btn-secondary"
                  >
                    Close
                  </motion.button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div>
                    <img
                      src={selectedScan.image}
                      alt={selectedScan.filename}
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-dark-400 mb-2">AI Analysis</h3>
                      <div className="glass-effect p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedScan.analysis}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm text-dark-400 mb-2">QR Code</h3>
                      <div className="glass-effect p-4 rounded-lg flex justify-center">
                        <QRCodeSVG
                          value={selectedScan.qrData}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => downloadQR(selectedScan)}
                        className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download QR Code
                      </motion.button>
                    </div>

                    <div>
                      <h3 className="text-sm text-dark-400 mb-2">Metadata</h3>
                      <div className="glass-effect p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-dark-400">Timestamp:</span>
                          <span>{new Date(selectedScan.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">ID:</span>
                          <span className="font-mono text-xs">{selectedScan.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {scans.length === 0 && !uploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center py-12"
        >
          <QrCode className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No scans yet</h3>
          <p className="text-dark-400">Upload an image to get started with AI analysis and QR generation</p>
        </motion.div>
      )}
    </div>
  );
}
