import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator as CalculatorIcon,
  Delete,
  History,
  Percent,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
  RotateCcw,
  Trash2
} from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [isNewCalculation, setIsNewCalculation] = useState(true);

  const formatNumber = (num) => {
    if (num === '' || num === '-') return num;
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleNumber = useCallback((num) => {
    if (isNewCalculation) {
      setDisplay(num);
      setExpression(num);
      setIsNewCalculation(false);
    } else {
      if (display === '0' && num !== '.') {
        setDisplay(num);
        setExpression(prev => prev.slice(0, -1) + num);
      } else if (num === '.' && display.includes('.')) {
        return;
      } else {
        setDisplay(prev => prev + num);
        setExpression(prev => prev + num);
      }
    }
  }, [display, isNewCalculation]);

  const handleOperator = useCallback((op) => {
    setIsNewCalculation(false);
    const operators = ['+', '-', '×', '÷'];
    const lastChar = expression.slice(-1);

    if (operators.includes(lastChar)) {
      setExpression(prev => prev.slice(0, -1) + op);
    } else {
      setExpression(prev => prev + op);
    }
    setDisplay('0');
  }, [expression]);

  const calculate = useCallback(() => {
    try {
      let evalExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '');

      // Remove trailing operator
      if (['+', '-', '*', '/'].includes(evalExpression.slice(-1))) {
        evalExpression = evalExpression.slice(0, -1);
      }

      if (!evalExpression) return;

      // Use Function constructor for safer evaluation
      const result = new Function('return ' + evalExpression)();

      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
        return;
      }

      const roundedResult = Math.round(result * 1e10) / 1e10;
      const resultStr = roundedResult.toString();

      // Add to history
      setHistory(prev => [{
        expression: expression,
        result: resultStr,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);

      setDisplay(resultStr);
      setExpression(resultStr);
      setLastResult(resultStr);
      setIsNewCalculation(true);
    } catch {
      setDisplay('Error');
      setIsNewCalculation(true);
    }
  }, [expression]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setIsNewCalculation(true);
  }, []);

  const handleBackspace = useCallback(() => {
    if (isNewCalculation) {
      handleClear();
      return;
    }

    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
      setExpression(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression(prev => prev.slice(0, -1));
    }
  }, [display, isNewCalculation, handleClear]);

  const handlePercent = useCallback(() => {
    const num = parseFloat(display.replace(/,/g, ''));
    if (!isNaN(num)) {
      const result = (num / 100).toString();
      setDisplay(result);
      setExpression(prev => {
        const match = prev.match(/[\d.]+$/);
        if (match) {
          return prev.slice(0, -match[0].length) + result;
        }
        return result;
      });
    }
  }, [display]);

  const handlePlusMinus = useCallback(() => {
    if (display !== '0') {
      if (display.startsWith('-')) {
        setDisplay(prev => prev.slice(1));
        setExpression(prev => {
          const match = prev.match(/-[\d.]+$/);
          if (match) {
            return prev.slice(0, -match[0].length) + match[0].slice(1);
          }
          return prev;
        });
      } else {
        setDisplay(prev => '-' + prev);
        setExpression(prev => {
          const match = prev.match(/[\d.]+$/);
          if (match) {
            return prev.slice(0, -match[0].length) + '-' + match[0];
          }
          return '-' + prev;
        });
      }
    }
  }, [display]);

  const useHistoryItem = useCallback((item) => {
    setDisplay(item.result);
    setExpression(item.result);
    setIsNewCalculation(true);
    setShowHistory(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleNumber('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === '%') {
        handlePercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, calculate, handleBackspace, handleClear, handlePercent]);

  const buttons = [
    { label: 'C', action: handleClear, className: 'bg-dark-700/80 hover:bg-dark-600/80 text-rose-400', icon: RotateCcw },
    { label: '±', action: handlePlusMinus, className: 'bg-dark-700/80 hover:bg-dark-600/80 text-dark-300' },
    { label: '%', action: handlePercent, className: 'bg-dark-700/80 hover:bg-dark-600/80 text-dark-300', icon: Percent },
    { label: '÷', action: () => handleOperator('÷'), className: 'bg-primary-500/20 hover:bg-primary-500/30 text-primary-400', icon: Divide },

    { label: '7', action: () => handleNumber('7'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '8', action: () => handleNumber('8'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '9', action: () => handleNumber('9'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '×', action: () => handleOperator('×'), className: 'bg-primary-500/20 hover:bg-primary-500/30 text-primary-400', icon: X },

    { label: '4', action: () => handleNumber('4'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '5', action: () => handleNumber('5'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '6', action: () => handleNumber('6'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '-', action: () => handleOperator('-'), className: 'bg-primary-500/20 hover:bg-primary-500/30 text-primary-400', icon: Minus },

    { label: '1', action: () => handleNumber('1'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '2', action: () => handleNumber('2'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '3', action: () => handleNumber('3'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '+', action: () => handleOperator('+'), className: 'bg-primary-500/20 hover:bg-primary-500/30 text-primary-400', icon: Plus },

    { label: '0', action: () => handleNumber('0'), className: 'bg-dark-800/80 hover:bg-dark-700/80 col-span-2' },
    { label: '.', action: () => handleNumber('.'), className: 'bg-dark-800/80 hover:bg-dark-700/80' },
    { label: '=', action: calculate, className: 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white shadow-lg shadow-primary-500/30', icon: Equal },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ultra relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10"
            >
              <CalculatorIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">Calculator</h1>
              <p className="text-dark-400 text-sm">Perform calculations with style</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(!showHistory)}
            className={`p-3 rounded-xl transition-all ${
              showHistory
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-dark-800/50 text-dark-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <History className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card-ultra overflow-hidden">
            {/* Display */}
            <div className="mb-6 p-6 rounded-2xl bg-dark-900/50 border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-dark-500 text-sm">Expression</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBackspace}
                  className="p-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 text-dark-400 hover:text-rose-400 transition-colors"
                >
                  <Delete className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="text-right">
                <p className="text-dark-400 text-lg h-7 overflow-hidden">
                  {expression || '0'}
                </p>
                <motion.p
                  key={display}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl sm:text-5xl font-bold text-white tracking-tight"
                >
                  {formatNumber(display)}
                </motion.p>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-3">
              {buttons.map((btn, index) => {
                const Icon = btn.icon;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={btn.action}
                    className={`
                      ${btn.className}
                      ${btn.label === '0' ? 'col-span-2' : ''}
                      p-4 sm:p-5 rounded-2xl font-semibold text-xl
                      transition-all duration-200 border border-white/5
                      flex items-center justify-center
                    `}
                  >
                    {Icon ? <Icon className="w-5 h-5" /> : btn.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Keyboard hint */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-center text-dark-500 text-xs">
                Use keyboard for quick input • Press Enter or = to calculate
              </p>
            </div>
          </div>
        </motion.div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1"
            >
              <div className="card-ultra h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary-400" />
                    History
                  </h3>
                  {history.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearHistory}
                      className="p-2 rounded-lg bg-dark-800/50 hover:bg-rose-500/20 text-dark-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 bg-dark-800/50 rounded-full flex items-center justify-center mb-4"
                      >
                        <History className="w-8 h-8 text-dark-600" />
                      </motion.div>
                      <p className="text-dark-500 text-sm">No calculations yet</p>
                      <p className="text-dark-600 text-xs mt-1">Your history will appear here</p>
                    </div>
                  ) : (
                    history.map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        onClick={() => useHistoryItem(item)}
                        className="w-full glass-effect-hover p-4 rounded-xl text-left group"
                      >
                        <p className="text-dark-400 text-sm truncate group-hover:text-dark-300">
                          {item.expression}
                        </p>
                        <p className="text-white font-semibold text-lg truncate group-hover:text-primary-400 transition-colors">
                          = {formatNumber(item.result)}
                        </p>
                        <p className="text-dark-600 text-xs mt-1">
                          {item.timestamp}
                        </p>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Info when history is hidden */}
        {!showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-ultra h-full">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5 text-primary-400" />
                Quick Tips
              </h3>

              <div className="space-y-4">
                <TipCard
                  title="Keyboard Shortcuts"
                  items={[
                    '0-9: Enter numbers',
                    '+, -, *, /: Operators',
                    'Enter or =: Calculate',
                    'Backspace: Delete',
                    'Escape: Clear all',
                    '%: Percentage'
                  ]}
                />

                <TipCard
                  title="Features"
                  items={[
                    'Chain calculations',
                    'Calculation history',
                    'Click history to reuse',
                    'Large number formatting'
                  ]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TipCard({ title, items }) {
  return (
    <div className="p-4 rounded-xl bg-dark-800/30 border border-white/5">
      <h4 className="font-medium text-sm text-primary-400 mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-dark-400 text-xs flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
