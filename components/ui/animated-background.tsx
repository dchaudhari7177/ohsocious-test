"use client"

import { motion } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Gradient animation
  const gradientProps = useSpring({
    from: { x: 0 },
    to: { x: 100 },
    config: { duration: 15000 },
    loop: true
  })

  // Connection lines animation
  const connectionProps = useSpring({
    from: { y: 0 },
    to: { y: 20 },
    config: { duration: 2000, tension: 300 },
    loop: { reverse: true }
  })

  // Mouse movement effect
  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 25,
        y: (e.clientY / window.innerHeight) * 25
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isMobile])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Main gradient background */}
      <animated.div
        style={{
          backgroundImage: "linear-gradient(-45deg, #FF3366, #FF6B6B, #4F46E5, #7C3AED, #2563EB, #06B6D4)",
          backgroundSize: "400% 400%",
          backgroundPosition: gradientProps.x.to(x => `${x}% 50%`),
        }}
        className="absolute inset-0 opacity-25"
      />

      {/* Animated shapes */}
      <div className="absolute inset-0">
        {/* Connection nodes */}
        <div className="absolute inset-0">
          {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
            <motion.div
              key={`node-${i}`}
              className="absolute"
              style={{
                left: `${(i * 25) + Math.random() * 10}%`,
                top: `${(Math.random() * 60) + 20}%`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-purple-500/20" />
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-20" />
            </motion.div>
          ))}
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0.3)" />
            </linearGradient>
          </defs>
          {Array.from({ length: isMobile ? 3 : 5 }).map((_, i) => (
            <motion.path
              key={`line-${i}`}
              d={`M ${50 + i * 150} ${100 + i * 50} Q ${150 + i * 100} ${150} ${250 + i * 50} ${200 + i * 25}`}
              stroke="url(#line-gradient)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.5,
              }}
            />
          ))}
        </svg>

        {/* Floating orbs with connection effect */}
        <motion.div
          animate={
            isMobile 
              ? {
                  y: [0, -20, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }
              : {
                  x: [mousePosition.x, -mousePosition.x],
                  y: [mousePosition.y, -mousePosition.y],
                }
          }
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/4 left-1/4 md:w-96 md:h-96 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-3xl"
        >
          <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-full" />
        </motion.div>

        <motion.div
          animate={
            isMobile 
              ? {
                  y: [0, -20, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                  }
                }
              : {
                  x: [-mousePosition.x, mousePosition.x],
                  y: [-mousePosition.y, mousePosition.y],
                }
          }
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          className="absolute bottom-1/4 right-1/4 md:w-96 md:h-96 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-3xl"
        >
          <div className="absolute inset-0 animate-pulse-slow bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full" />
        </motion.div>

        {/* Interactive particles */}
        {Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 md:w-2 md:h-2 bg-gradient-to-br from-white to-purple-500/50 rounded-full"
          />
        ))}

        {/* Social interaction indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: isMobile ? 3 : 5 }).map((_, i) => (
            <motion.div
              key={`indicator-${i}`}
              className="absolute"
              style={{
                right: `${(i * 20) + Math.random() * 10}%`,
                top: `${(Math.random() * 70) + 15}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 3,
              }}
            >
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-pink-500" />
                <div className="w-4 h-0.5 md:w-6 md:h-1 rounded-full bg-gradient-to-r from-pink-500 to-transparent" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Glass effect overlay */}
        <div className="absolute inset-0 backdrop-blur-[40px] md:backdrop-blur-[80px]" />
      </div>

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}