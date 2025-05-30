"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, WavesIcon as Wave, X, Check } from "lucide-react"
import { StudentCard } from "@/components/student-card"
import { Navbar } from "@/components/navbar"
import { calculateMatchScore } from "@/lib/matching"
import { useToast } from "@/components/ui/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { wrap } from "framer-motion";

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
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const { toast } = useToast()

  const handleSwipe = (direction: "left" | "right" | "wave", studentName: string) => {
    console.log(`Swiped ${direction} on ${studentName}`)
    if (direction === "right" && matchScore > 0.7) {
      toast({
        title: "Match!",
        description: `You matched with ${studentName}!`,
        duration: 3000,
      })
    }

    // Set swipe direction for exit animation if it's a left or right swipe
    if (direction === "left" || direction === "right") {
        setSwipeDirection(direction);
    }

    // Delay state update to allow exit animation
    setTimeout(() => {
      setSwipeDirection(null); // Reset after animation
      const nextIndex = currentIndex + 1;
      if (nextIndex < students.length) {
        setCurrentIndex(nextIndex);
      } else {
        // Reached end of list, show empty state
        setCurrentIndex(students.length); // Set index out of bounds to show empty state
      }
    }, 400); // Duration should match exit animation duration
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: import("framer-motion").PanInfo) => {
    const threshold = 150; // Distance threshold for a swipe
    const velocity = info.velocity.x; // Get swipe velocity

    if (info.offset.x > threshold || velocity > 500) {
      // Swiped right
      handleSwipe("right", students[currentIndex].name);
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swiped left
      handleSwipe("left", students[currentIndex].name);
    } else {
      // Not a full swipe, animate back to center (handled by Framer Motion default behavior)
      setSwipeDirection(null); // Ensure no exit animation
    }
  };

  // Calculate match score for the current student
  const currentStudent = students[currentIndex]
  const matchScore = currentStudent ? calculateMatchScore(currentStudent, students[0]) : 0;

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
            className="relative mx-auto max-w-sm min-h-[450px] flex items-center justify-center select-none"
            style={{ touchAction: "pan-y" }}
          >
            <AnimatePresence initial={false} mode="wait">
            {currentStudent ? (
                <motion.div
                  key={currentStudent.id}
                  className="w-full h-full flex items-center justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragEnd={handleDragEnd}
                  initial={{ rotate: 0, opacity: 1, scale: 1, x: 0 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1, x: 0 }}
                  exit={{
                    x: swipeDirection === 'right' ? 800 : swipeDirection === 'left' ? -800 : 0,
                    rotate: swipeDirection === 'right' ? 40 : swipeDirection === 'left' ? -40 : 0,
                    opacity: 0,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center"
                    style={{
                      backgroundColor: swipeDirection === "right" ? "rgba(0, 255, 0, 0.1)" : swipeDirection === "left" ? "rgba(255, 0, 0, 0.1)" : "transparent",
                      borderRadius: '0.75rem'
                    }}
                  >
                    <StudentCard student={currentStudent} />
                    {swipeDirection === "right" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 right-4 flex items-center text-green-500 font-bold text-2xl rotate-12"
                      >
                        CONNECT!
                      </motion.div>
                    )}
                    {swipeDirection === "left" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 left-4 flex items-center text-red-500 font-bold text-2xl -rotate-12"
                      >
                        NAH!
                      </motion.div>
                    )}
                  </div>
                </motion.div>
            ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500"
                >
                  <p>No more students to discover right now!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-gray-300"
              onClick={() => handleSwipe("left", students[currentIndex].name)}
            >
              <X className="h-6 w-6 text-gray-500" />
            </Button>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600"
              onClick={() => handleSwipe("wave", students[currentIndex].name)}
            >
              <Wave className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-primary-purple hover:bg-primary-purple/90"
              onClick={() => handleSwipe("right", students[currentIndex].name)}
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
