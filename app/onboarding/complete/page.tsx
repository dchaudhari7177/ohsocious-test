"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CompletePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate profile creation
  useState(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  })

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="space-y-6">
      <Progress value={isLoading ? 95 : 100} className="h-2 bg-gray-100" />

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isLoading ? "Setting Up Your Profile" : "You're All Set!"}
        </h2>
        <p className="text-sm text-gray-500">
          {isLoading ? "Just a moment while we create your profile..." : "Your profile is ready to go"}
        </p>
      </div>

      <div className="flex justify-center py-6">
        {isLoading ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-100">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-100">
            <CheckCircle className="h-12 w-12 text-rose-500" />
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="space-y-4">
          <div className="rounded-lg bg-pink-50 p-4 text-center">
            <p className="text-sm text-rose-700">
              We've found <span className="font-bold">27 potential matches</span> on your campus!
            </p>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Start swiping to find your perfect match</p>
          </div>

          <Button onClick={handleFinish} className="w-full bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
            <Heart className="mr-2 h-4 w-4" /> Start Matching
          </Button>
        </div>
      )}
    </div>
  )
}
