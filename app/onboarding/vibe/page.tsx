"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

type Vibe = {
  emoji: string
  name: string
  description: string
}

const vibes: Vibe[] = [
  {
    emoji: "🔥",
    name: "Party Animal",
    description: "Always down for a good time",
  },
  {
    emoji: "📚",
    name: "Bookworm",
    description: "Knowledge is power",
  },
  {
    emoji: "💬",
    name: "Gossip Guru",
    description: "Always in the know",
  },
  {
    emoji: "🧘‍♀️",
    name: "Zen Mode",
    description: "Calm and collected",
  },
  {
    emoji: "👾",
    name: "Meme Lord",
    description: "Internet humor specialist",
  },
]

export default function VibeSelectionPage() {
  const router = useRouter()
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refreshUserData } = useAuth()

  const handleContinue = async () => {
    if (!selectedVibe) return
    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user found")

      // Find the full vibe object
      const selectedVibeObj = vibes.find(v => v.name === selectedVibe)
      if (!selectedVibeObj) throw new Error("Selected vibe not found")

      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        vibe: {
          emoji: selectedVibeObj.emoji,
          name: selectedVibeObj.name
        },
        vibeCompleted: true,
        updatedAt: new Date().toISOString()
      })

      // Refresh user data in context
      await refreshUserData()

      // Navigate to next page
      router.push("/onboarding/interests")
    } catch (error) {
      console.error("Error updating vibe:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Pick your vibe</h1>
        <p className="text-sm text-gray-600">How would you describe yourself?</p>
      </div>

      <div className="grid gap-3">
        {vibes.map((vibe) => (
          <Card
            key={vibe.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVibe === vibe.name
                ? "border-2 border-primary-purple bg-primary-purple/5"
                : "border border-gray-200 bg-white"
            }`}
            onClick={() => setSelectedVibe(vibe.name)}
          >
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl">
                {vibe.emoji}
              </div>
              <div>
                <p className="font-medium text-gray-900">{vibe.name}</p>
                <p className="text-xs text-gray-500">{vibe.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        className="w-full bg-primary-purple hover:bg-primary-purple/90"
        disabled={!selectedVibe || isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  )
}
