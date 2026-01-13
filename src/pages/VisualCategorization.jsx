import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FolderTree,
  Grid3x3,
  List,
  Tag,
  Sparkles,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit3,
  Copy,
  Search
} from 'lucide-react';

export default function VisualCategorization() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'uncategorized', name: 'Uncategorized', color: '#64748b', count: 0 },
    { id: 'documents', name: 'Documents', color: '#3b82f6', count: 0 },
    { id: 'images', name: 'Images', color: '#8b5cf6', count: 0 },
    { id: 'data', name: 'Data', color: '#10b981', count: 0 },
    { id: 'other', name: 'Other', color: '#f59e0b', count: 0 },
  ]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    const newItems = files.map((file, index) => ({
      id: `item-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      category: 'uncategorized',
      status: 'pending', // pending, categorized, error
      preview: null,
      aiSuggestion: null,
      timestamp: new Date().toISOString()
    }));

    // Create previews for images
    for (const item of newItems) {
      if (item.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          item.preview = reader.result;
          setItems(prev => [...prev]);
        };
        reader.readAsDataURL(item.file);
      }
    }

    setItems(prev => [...prev, ...newItems]);
  };

  const categorizeItems = async () => {
    setProcessing(true);
    const pendingItems = items.filter(item => item.status === 'pending');

    try {
      for (const item of pendingItems) {
        // Prepare data for AI categorization
        const itemData = {
          name: item.name,
          type: item.type,
          size: item.size
        };

        // If it's an image, include preview
        if (item.preview) {
          itemData.preview = item.preview.split(',')[1]; // Remove data:image/...;base64,
        }

        const response = await fetch('/api/categorization/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: itemData })
        });

        const result = await response.json();

        if (result.success) {
          item.category = result.category;
          item.aiSuggestion = result.suggestion;
          item.status = 'categorized';
        } else {
          item.status = 'error';
          item.error = result.error;
        }

        setItems(prev => [...prev]);
      }
    } catch (error) {
      console.error('Categorization error:', error);
    } finally {
      setProcessing(false);
      updateCategoryCounts();
    }
  };

  const updateCategoryCounts = () => {
    const counts = {};
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: counts[cat.id] || 0
    })));
  };

  const handleCategoryChange = (itemId, newCategory) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, category: newCategory } : item
    ));
    updateCategoryCounts();
  };

  const deleteItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    updateCategoryCounts();
  };

  const deleteSelected = () => {
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    updateCategoryCounts();
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const exportCategories = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      categories: categories,
      items: items.map(item => ({
        name: item.name,
        type: item.type,
        category: item.category,
        aiSuggestion: item.aiSuggestion,
        timestamp: item.timestamp
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categorization-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Visual Categorization
          </h1>
          <p className="text-dark-300">
            AI-powered organization with ToolBoxPro
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
        >
          <FolderTree className="w-5 h-5 text-primary-500" />
          <span className="text-white font-medium">{items.length} Items</span>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="glass-effect rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Categorize Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={categorizeItems}
            disabled={processing || items.filter(i => i.status === 'pending').length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {processing ? 'Categorizing...' : 'Auto-Categorize'}
          </motion.button>

          {/* Export Button */}
          {items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportCategories}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-white rounded-lg font-medium hover:bg-dark-600 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          )}

          {/* Delete Selected */}
          {selectedItems.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedItems.length})
            </motion.button>
          )}

          <div className="flex-1" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark-700 text-white rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-dark-300 uppercase mb-3">Categories</h3>
            
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-dark-300 hover:bg-white/5'
              }`}
            >
              <span className="font-medium">All Items</span>
              <span className="text-sm">{items.length}</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className="text-sm">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Display */}
        <div className="lg:col-span-3">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-xl p-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500/20 rounded-full mb-4">
                <Upload className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Items Yet</h3>
              <p className="text-dark-300 mb-6">
                Upload files to get started with AI-powered categorization
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
              >
                Upload Your First File
              </button>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    categories={categories}
                    isSelected={selectedItems.includes(item.id)}
                    onToggleSelect={() => toggleItemSelection(item.id)}
                    onCategoryChange={handleCategoryChange}
                    onDelete={deleteItem}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  viewMode,
  categories,
  isSelected,
  onToggleSelect,
  onCategoryChange,
  onDelete,
  formatFileSize
}) {
  const [showMenu, setShowMenu] = useState(false);
  const category = categories.find(c => c.id === item.category);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`glass-effect rounded-lg p-4 flex items-center gap-4 ${
          isSelected ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
        />

        {item.preview ? (
          <img src={item.preview} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
        ) : (
          <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-dark-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{item.name}</h4>
          <p className="text-sm text-dark-400">{formatFileSize(item.size)}</p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{
              backgroundColor: `${category?.color}20`,
              color: category?.color
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color }} />
            {category?.name}
          </div>

          <StatusBadge status={item.status} />

          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass-effect rounded-xl overflow-hidden ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="relative">
        {item.preview ? (
          <img src={item.preview} alt={item.name} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-dark-700 flex items-center justify-center">
            <FileText className="w-16 h-16 text-dark-400" />
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="absolute top-2 right-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-white font-medium truncate mb-2">{item.name}</h4>
        <p className="text-sm text-dark-400 mb-3">{formatFileSize(item.size)}</p>

        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-dark-400" />
          <select
            value={item.category}
            onChange={(e) => onCategoryChange(item.id, e.target.value)}
            className="flex-1 px-2 py-1 bg-dark-700 text-white text-sm rounded border border-dark-600 focus:border-primary-500 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {item.aiSuggestion && (
          <div className="text-xs text-dark-400 bg-dark-700/50 rounded p-2 mb-3">
            <span className="text-primary-400">AI:</span> {item.aiSuggestion}
          </div>
        )}

        <button
          onClick={() => onDelete(item.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-500/20', spin: true },
    categorized: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', spin: false },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', spin: false },
  };

  const { icon: Icon, color, bg, spin } = config[status] || config.pending;

  return (
    <div className={`${bg} ${color} px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium`}>
      <Icon className={`w-3 h-3 ${spin ? 'animate-spin' : ''}`} />
      {status}
    </div>
  );
}
