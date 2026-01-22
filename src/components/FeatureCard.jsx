import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient = "from-primary-500 via-primary-600 to-accent-violet",
  onClick,
  delay = 0,
  features = []
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`card-interactive group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        {/* Icon */}
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 border border-white/20 mb-4 relative`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          {/* Icon glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-lg opacity-50 -z-10`}></div>
        </motion.div>
        
        {/* Content */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-gradient-primary transition-all">
              {title}
            </h3>
            {onClick && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowUpRight className="w-5 h-5 text-primary-400" />
              </motion.div>
            )}
          </div>
          <p className="text-dark-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature list */}
        {features.length > 0 && (
          <ul className="space-y-2 mt-4 pt-4 border-t border-white/10">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 * (index + 1) }}
                className="flex items-center gap-2 text-sm text-dark-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-accent-violet"></div>
                {feature}
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="shimmer absolute inset-0" />
      </div>
    </motion.div>
  );
}
