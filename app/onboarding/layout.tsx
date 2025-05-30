"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#A259FF] via-[#F3E8FF] to-white transition-colors duration-700">
      <div className="container max-w-md px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="drop-shadow-xl"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
