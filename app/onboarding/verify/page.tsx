"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResend = () => {
    setIsResending(true)
    // Simulate API call
    setTimeout(() => {
      setIsResending(false)
      setCountdown(60)
    }, 1500)
  }

  // Simulate verification for demo purposes
  const handleVerify = () => {
    router.push("/onboarding/profile")
  }

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-purple/10">
          <Mail className="h-8 w-8 text-primary-purple" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
        <p className="text-sm text-gray-600">
          We sent a magic link to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary-purple/10 p-1">
            <CheckCircle className="h-4 w-4 text-primary-purple" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">Click the link in your email</p>
            <p className="text-xs text-gray-600">
              The magic link will verify your college email and create your account
            </p>
          </div>
        </div>
      </div>

      {/* For demo purposes, we'll add a button to simulate verification */}
      <Button onClick={handleVerify} className="w-full bg-primary-purple hover:bg-primary-purple/90">
        <span className="flex items-center gap-2">
          Simulate Verification <ArrowRight className="h-4 w-4" />
        </span>
      </Button>

      <div className="text-center">
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
            "Resend magic link"
          )}
        </Button>
      </div>
    </div>
  )
}
