"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { Loader2, UserPlus, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createFollowNotification } from "@/lib/notifications"

interface UserProfile {
  firstName: string
  lastName: string
  department: string
  year: string
  bio?: string
  profileImage?: string
  coverImage?: string
  vibe?: { emoji: string; name: string }
  interests?: string[]
  following?: string[]
  followers?: string[]
}

export default function ProfilePage() {
  const params = useParams()
  const userId = typeof params.userId === "string" ? params.userId : null
  const router = useRouter()
  const { user, userData, refreshUserData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const handleFollow = async () => {
    if (!user || !profile || !userId) return

    try {
      console.log("Starting follow operation for:", userId)
      const isFollowing = userData?.following?.includes(userId)
      const userRef = doc(db, "users", user.uid)

      await updateDoc(userRef, {
        following: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
      })
      console.log("Updated following array for current user")

      const otherUserRef = doc(db, "users", userId)
      await updateDoc(otherUserRef, {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid),
      })
      console.log("Updated followers array for target user")

      if (!isFollowing) {
        console.log("Creating follow notification")
        await createFollowNotification({
          followerId: user.uid,
          followerName: `${userData?.firstName} ${userData?.lastName}`,
          followerAvatar: userData?.profileImage,
          userId: userId,
        })
        console.log("Follow notification created successfully")
      }

      await refreshUserData()
      console.log("User data refreshed")
    } catch (error) {
      console.error("Error in follow operation:", error)
    }
  }

  const handleStartChat = async () => {
    if (!user || !userId) return

    try {
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      )
      const snapshot = await getDocs(chatsQuery)
      const existingChat = snapshot.docs.find((doc) => {
        const data = doc.data()
        return data.participants.includes(userId)
      })

      if (existingChat) {
        router.push(`/chat?id=${existingChat.id}`)
        return
      }

      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [user.uid, userId],
        lastMessage: "",
        timestamp: serverTimestamp(),
        unreadCount: 0,
      })

      router.push(`/chat?id=${chatRef.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  if (!user || !userData) return null

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
        </div>
      </Container>
    )
  }

  if (!profile || !userId) {
    return (
      <Container>
        <div className="py-8 text-center">
          <h2 className="text-lg font-semibold">User not found</h2>
          <p className="mt-2 text-gray-500">This user profile does not exist.</p>
        </div>
      </Container>
    )
  }

  const isFollowing = userData.following?.includes(userId)
  const fullName = `${profile.firstName} ${profile.lastName}`
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <Container>
      <div className="py-6 md:py-8">
        <div className="relative mb-6 h-48 overflow-hidden rounded-lg bg-gray-100">
          {profile.coverImage ? (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-primary-purple/20 to-primary-purple/10" />
          )}
        </div>

        <div className="relative z-10 -mt-16 px-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32 border-4 border-white">
              {profile.profileImage ? (
                <AvatarImage src={profile.profileImage} alt={fullName} />
              ) : (
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              )}
            </Avatar>
            <h1 className="mt-4 text-2xl font-bold">{fullName}</h1>
            <p className="text-gray-500">
              {profile.department} • {profile.year}
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              className={cn(
                "flex items-center gap-1",
                isFollowing && "hover:bg-destructive hover:text-white"
              )}
            >
              <UserPlus className="h-4 w-4" />
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
            <Button variant="outline" onClick={handleStartChat}>
              <MessageCircle className="mr-1 h-4 w-4" />
              Message
            </Button>
          </div>

          <div className="mt-8 grid gap-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">About</h2>
              {profile.bio ? (
                <p className="text-gray-600">{profile.bio}</p>
              ) : (
                <p className="text-gray-500">No bio available</p>
              )}
            </Card>

            {profile.vibe && (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Current Vibe</h2>
                <p className="flex items-center text-lg">
                  <span className="mr-2">{profile.vibe.emoji}</span>
                  {profile.vibe.name}
                </p>
              </Card>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Network</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">
                    {profile.followers?.length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {profile.following?.length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
} 