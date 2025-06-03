"use client"

import { motion } from "framer-motion"
import { Button } from "./button"
import { FcGoogle } from "react-icons/fc"

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void
  className?: string
}

export function SocialAuthButtons({
  onGoogleClick,
  className = ""
}: SocialAuthButtonsProps) {
  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98
    }
  }

  return (
    <div className={`${className}`}>
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          type="button"
          variant="outline"
          className="relative w-full h-12 font-medium border-2"
          onClick={onGoogleClick}
        >
          <FcGoogle className="absolute left-4 w-5 h-5" />
          Sign in with Google
        </Button>
      </motion.div>
    </div>
  )
} 