"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

const interestCategories = [
  {
    name: "Entertainment",
    interests: ["Music", "Movies", "TV Shows", "Gaming", "Reading", "Art"],
  },
  {
    name: "Sports & Activities",
    interests: ["Basketball", "Football", "Soccer", "Volleyball", "Yoga", "Hiking", "Gym"],
  },
  {
    name: "Academic",
    interests: ["Startups", "Research", "Notes Exchange", "Study Groups", "Tutoring"],
  },
  {
    name: "Campus Life",
    interests: ["Events", "Clubs", "Greek Life", "Volunteering", "Student Government"],
  },
  {
    name: "Lifestyle",
    interests: ["Food", "Fashion", "Travel", "Photography", "Cooking", "Sustainability"],
  },
]

export default function InterestsPage() {
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refreshUserData } = useAuth()

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const handleContinue = async () => {
    if (selectedInterests.length < 3) return
    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user found")

      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        interests: selectedInterests,
        interestsCompleted: true,
        updatedAt: new Date().toISOString()
      })

      // Refresh user data in context
      await refreshUserData()

      // Navigate to next page
      router.push("/onboarding/welcome")
    } catch (error) {
      console.error("Error updating interests:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Select your interests</h1>
        <p className="text-sm text-gray-600">Pick at least 3 interests to help us personalize your experience</p>
      </div>

      <div className="max-h-[350px] space-y-4 overflow-y-auto pr-2">
        {interestCategories.map((category) => (
          <div key={category.name} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">{category.name}</h3>
            <div className="flex flex-wrap gap-2">
              {category.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedInterests.includes(interest)
                      ? "bg-primary-purple hover:bg-primary-purple/90"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <p className="text-sm text-gray-700">
          {selectedInterests.length < 3
            ? `Select at least ${3 - selectedInterests.length} more`
            : `${selectedInterests.length} interests selected`}
        </p>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full bg-primary-purple hover:bg-primary-purple/90"
        disabled={selectedInterests.length < 3 || isSubmitting}
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
