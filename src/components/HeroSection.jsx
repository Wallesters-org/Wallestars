import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ 
  title, 
  subtitle, 
  icon: Icon, 
  gradient = "from-primary-500 via-accent-violet to-accent-purple",
  children 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-ultra relative overflow-hidden group mb-6"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-primary mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-dark-400 text-sm sm:text-base lg:text-lg">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
        
        {Icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ rotate: 180, scale: 1.1 }}
            className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/40 border border-white/20 relative`}
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            {/* Icon glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-50 -z-10`}></div>
          </motion.div>
        )}
      </div>

      {/* Additional content */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          {children}
        </motion.div>
      )}

      {/* Decorative ambient glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
      />
    </motion.div>
  );
}
