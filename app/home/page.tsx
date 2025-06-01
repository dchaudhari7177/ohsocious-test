"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/onboarding/signup")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Welcome to Ohsocious</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Feed Section */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Your Feed</h2>
          <p className="text-gray-600">Start connecting with your college community!</p>
        </div>

        {/* Events Section */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
          <p className="text-gray-600">Discover events happening around your campus.</p>
        </div>

        {/* Connections Section */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Suggested Connections</h2>
          <p className="text-gray-600">Find and connect with your classmates.</p>
        </div>
      </div>
    </div>
  )
} 