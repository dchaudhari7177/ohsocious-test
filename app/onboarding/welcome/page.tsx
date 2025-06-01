"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export default function WelcomePage() {
  const router = useRouter()
  const { userData, refreshUserData } = useAuth()
  const [confetti, setConfetti] = useState<{ id: number; left: string; delay: string; color: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Create confetti pieces
    const pieces = []
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        color: getRandomColor(),
      })
    }
    setConfetti(pieces)

    // Cleanup function
    return () => {
      setConfetti([])
    }
  }, [])

  const getRandomColor = () => {
    const colors = ["#7E5BEF", "#FF5C8A", "#FBBF24", "#34D399"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleContinue = async () => {
    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user found")

      // Mark onboarding as completed in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      })

      // Refresh user data in context
      await refreshUserData()

      // Navigate to feed
      router.push("/feed")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white p-6 shadow-lg">
      {/* Confetti animation */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            backgroundColor: piece.color,
            width: `${Math.random() * 8 + 5}px`,
            height: `${Math.random() * 8 + 5}px`,
          }}
        />
      ))}

      <div className="relative z-10 space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-purple/10">
          <div className="text-4xl">🎉</div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to ohsocious!</h1>
          <p className="text-sm text-gray-600">Your profile is all set up and ready to go</p>
        </div>

        <div className="mx-auto max-w-xs rounded-lg bg-gradient-to-r from-primary-purple to-secondary-pink p-[2px]">
          <div className="rounded-[calc(0.5rem-2px)] bg-white p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={userData?.profileImage || "/placeholder.svg?height=48&width=48"}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {userData?.firstName} {userData?.lastName}
                </p>
                <p className="text-xs text-gray-500">{userData?.department} • {userData?.year}</p>
                <div className="mt-1 flex gap-1">
                  {userData?.interests?.slice(0, 2).map((interest) => (
                    <span
                      key={interest}
                      className="inline-block rounded-full bg-primary-purple/10 px-2 py-0.5 text-xs text-primary-purple"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full bg-primary-purple hover:bg-primary-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Setting up...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Go to Campus Feed <Rocket className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
