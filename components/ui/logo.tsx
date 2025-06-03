"use client"

import { motion } from "framer-motion"

export function Logo({ className = "", size = "medium" }: { className?: string; size?: "small" | "medium" | "large" }) {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24"
  }

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Main circle with gradient */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-purple via-pink-500 to-primary-purple"
      />
      
      {/* Animated heart shape */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/5 h-3/5 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="white"
          />
        </svg>
      </motion.div>

      {/* Decorative rings */}
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute inset-0 rounded-full border-2 border-white"
      />
      <motion.div
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute -inset-2 rounded-full border-2 border-white"
      />
    </div>
  )
} 