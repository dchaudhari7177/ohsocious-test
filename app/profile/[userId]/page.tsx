"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  department: string
  year: string
  bio: string
  profileImage?: string
  vibe?: { emoji: string; name: string }
  interests?: string[]
  connectionsCount?: number
}

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId || typeof userId !== "string") {
        setError("Invalid profile")
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (!userDoc.exists()) {
          setError("Profile not found")
          setLoading(false)
          return
        }

        const data = userDoc.data()
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          department: data.department || "",
          year: data.year || "",
          bio: data.bio || "",
          profileImage: data.profileImage,
          vibe: data.vibe,
          interests: data.interests || [],
          connectionsCount: data.connectionsCount || 0
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [userId])

  const handleMessage = () => {
    if (userId && typeof userId === "string") {
      router.push(`/chat/${userId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/feed">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">{error}</h2>
          <p className="mt-2 text-gray-500">The profile you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button className="mt-4" asChild>
            <Link href="/feed">Return to Feed</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const isOwnProfile = currentUser?.uid === userId

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feed">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-r from-primary-purple/20 to-primary-purple/10">
          <div className="absolute -bottom-12 left-4">
            <Avatar className="h-24 w-24 border-4 border-white">
              {profileData.profileImage ? (
                <AvatarImage src={profileData.profileImage} alt={`${profileData.firstName} ${profileData.lastName}`} />
              ) : (
                <AvatarFallback>
                  {profileData.firstName[0]}
                  {profileData.lastName[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          {!isOwnProfile && (
            <div className="absolute right-4 top-4">
              <Button onClick={handleMessage}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-6 pt-16">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-gray-500">@{profileData.username}</p>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-gray-600">{profileData.bio}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{profileData.department}</span>
              <span>•</span>
              <span>{profileData.year}</span>
            </div>
          </div>

          {/* Vibe */}
          {profileData.vibe && (
            <div className="mb-6">
              <h2 className="mb-2 font-semibold">Current Vibe</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{profileData.vibe.emoji}</span>
                <span>{profileData.vibe.name}</span>
              </div>
            </div>
          )}

          {/* Interests */}
          {profileData.interests && profileData.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 font-semibold">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div>
              <span className="font-semibold text-gray-900">{profileData.connectionsCount}</span>{" "}
              connections
            </div>
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings">Edit Profile</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 