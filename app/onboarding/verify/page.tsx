"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth } from "@/lib/firebase"
import { sendEmailVerification, reload } from "firebase/auth"
import { useAuth } from "@/contexts/auth-context"

export default function VerifyPage() {
  const router = useRouter()
  const { refreshUserData } = useAuth()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Single verification check function
  const checkVerification = useCallback(async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        router.push("/onboarding/login")
        return false
      }

      await reload(user)
      if (user.emailVerified) {
        setIsVerified(true)
        await refreshUserData()
        setTimeout(() => {
          router.push("/onboarding/profile")
        }, 1500)
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking verification:", error)
      return false
    }
  }, [router, refreshUserData])

  // Single verification check effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let isActive = true

    const runVerificationCheck = async () => {
      if (!isActive) return
      
      const verified = await checkVerification()
      if (verified) {
        if (interval) clearInterval(interval)
        return
      }

      if (!interval && isActive) {
        interval = setInterval(async () => {
          const verified = await checkVerification()
          if (verified && interval) {
            clearInterval(interval)
          }
        }, 3000)
      }
      
      setIsChecking(false)
    }

    runVerificationCheck()

    return () => {
      isActive = false
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [checkVerification])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResend = async () => {
    if (isResending || countdown > 0) return
    
    setIsResending(true)
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        setCountdown(60)
      }
    } catch (error) {
      console.error("Error resending verification email:", error)
    }
    setIsResending(false)
  }

  if (isChecking) {
    return (
      <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-purple/10">
          <Mail className="h-8 w-8 text-primary-purple" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
        <p className="text-sm text-gray-600">
          We sent a verification link to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary-purple/10 p-1">
            <CheckCircle className="h-4 w-4 text-primary-purple" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">Click the verification link in your email</p>
            <p className="text-xs text-gray-600">
              The link will verify your college email and allow you to continue setting up your profile
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-600">Didn&apos;t receive an email?</p>
        <Button
          variant="link"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="text-primary-purple"
        >
          {isResending ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></span>
              Resending...
            </span>
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            "Resend verification link"
          )}
        </Button>
      </div>

      {isVerified && (
        <div className="rounded-lg bg-green-50 p-4 text-center text-green-700">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Email verified! Redirecting...
          </p>
        </div>
      )}
    </div>
  )
}
