"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, WavesIcon as Wave, X, Check } from "lucide-react"
import { StudentCard } from "@/components/student-card"
import { Navbar } from "@/components/navbar"
import { calculateMatchScore } from "@/lib/matching"
import { useToast } from "@/components/ui/use-toast"

// Sample student data
const students = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=300&width=300",
    department: "Computer Science",
    year: "Junior",
    vibe: "🔥",
    bio: "CS major with a passion for AI and machine learning. Coffee addict and night owl.",
    interests: ["Coding", "Music", "Coffee", "AI"],
  },
  {
    id: "2",
    name: "James Rodriguez",
    avatar: "/placeholder.svg?height=300&width=300",
    department: "Business",
    year: "Senior",
    vibe: "👾",
    bio: "Entrepreneurship enthusiast. Working on my third startup. Let's connect and talk business ideas!",
    interests: ["Startups", "Finance", "Basketball", "Travel"],
  },
  {
    id: "3",
    name: "Sophia Chen",
    avatar: "/placeholder.svg?height=300&width=300",
    department: "Psychology",
    year: "Sophomore",
    vibe: "📚",
    bio: "Psychology student interested in cognitive development. Love reading and hiking on weekends.",
    interests: ["Reading", "Hiking", "Psychology", "Art"],
  },
  {
    id: "4",
    name: "Marcus Johnson",
    avatar: "/placeholder.svg?height=300&width=300",
    department: "Engineering",
    year: "Freshman",
    vibe: "🧘‍♀️",
    bio: "First-year engineering student. Passionate about sustainable technology and renewable energy.",
    interests: ["Engineering", "Sustainability", "Soccer", "Gaming"],
  },
  {
    id: "5",
    name: "Olivia Martinez",
    avatar: "/placeholder.svg?height=300&width=300",
    department: "Art & Design",
    year: "Junior",
    vibe: "💬",
    bio: "Digital artist and illustrator. Looking for collaborators for my next exhibition project.",
    interests: ["Art", "Design", "Photography", "Music"],
  },
  {
    id: "6",
    name: "Ethan Park",
    avatar: "/placeholder.svg?height=300&width=300",
    department: "Computer Science",
    year: "Senior",
    vibe: "🔥",
    bio: "Full-stack developer and hackathon enthusiast. Always looking for new coding challenges.",
    interests: ["Coding", "Hackathons", "Coffee", "Gaming"],
  },
]

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const startX = useRef<number | null>(null)
  const { toast } = useToast()

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    startX.current = e.clientX
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startX.current === null) return
    setDragX(e.clientX - startX.current)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    if (dragX > 100) {
      setSwipeDirection("right")
      handleSwipe("right")
    } else if (dragX < -100) {
      setSwipeDirection("left")
      handleSwipe("left")
    } else {
      setSwipeDirection(null)
    }
    setDragX(0)
    startX.current = null
  }

  const handleSwipe = (direction: "left" | "right" | "wave") => {
    // In a real app, this would handle the swipe action
    console.log(`Swiped ${direction} on ${students[currentIndex].name}`)
    if (direction === "right" && matchScore > 0.7) {
      toast({
        title: "Match!",
        description: `You matched with ${students[currentIndex].name}!`,
        duration: 3000,
      })
    }
    if (currentIndex < students.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  // Calculate match score for the current student
  const currentStudent = students[currentIndex]
  const matchScore = calculateMatchScore(currentStudent, students[0]) // Assuming students[0] is the current user

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Discover Students</h1>
          <p className="text-sm text-gray-600">Connect with students who share your interests</p>
        </div>
        <div className="mt-6">
          <div
            className="relative mx-auto max-w-sm min-h-[400px] flex items-center justify-center select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: "pan-y" }}
          >
            <div
              className="w-full transition-all duration-200"
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX / 20}deg) scale(${isDragging ? 1.05 : 1})`,
                backgroundColor: swipeDirection === "right" ? "rgba(0, 255, 0, 0.2)" : swipeDirection === "left" ? "rgba(255, 0, 0, 0.2)" : "transparent",
              }}
            >
              <StudentCard student={currentStudent} />
              {swipeDirection === "right" && (
                <div className="absolute top-4 right-4 flex items-center">
                  <Check className="h-8 w-8 text-green-500" />
                  <span className="ml-2 text-green-500 font-bold">Connect!</span>
                </div>
              )}
              {swipeDirection === "left" && (
                <div className="absolute top-4 left-4 flex items-center">
                  <X className="h-8 w-8 text-red-500" />
                  <span className="ml-2 text-red-500 font-bold">Nah!</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-gray-300"
              onClick={() => handleSwipe("left")}
            >
              <X className="h-6 w-6 text-gray-500" />
            </Button>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600"
              onClick={() => handleSwipe("wave")}
            >
              <Wave className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-primary-purple hover:bg-primary-purple/90"
              onClick={() => handleSwipe("right")}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Match Score: {matchScore.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </>
  )
}
