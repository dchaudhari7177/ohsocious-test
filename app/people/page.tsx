"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { CardGrid } from "@/components/card-grid"
import { UserCard } from "@/components/user-card"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createFollowNotification } from "@/lib/notifications"

interface User {
  id: string
  firstName: string
  lastName: string
  department: string
  year: string
  profileImage?: string
  bio?: string
  vibe?: { emoji: string; name: string }
  interests?: string[]
}

export default function PeoplePage() {
  const router = useRouter()
  const { user, userData, refreshUserData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])

  // Fetch users
  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      try {
        // Get all users except the current user
        const usersQuery = query(collection(db, "users"))
        const snapshot = await getDocs(usersQuery)
        const usersData = snapshot.docs
          .filter(doc => doc.id !== user.uid) // Filter out current user
          .map((doc) => ({
            id: doc.id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            department: doc.data().department,
            year: doc.data().year,
            profileImage: doc.data().profileImage,
            bio: doc.data().bio,
            vibe: doc.data().vibe,
            interests: doc.data().interests,
          }))
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  const handleFollow = async (userId: string) => {
    if (!user) return

    try {
      const isFollowing = userData?.following?.includes(userId)
      const userRef = doc(db, "users", user.uid)

      await updateDoc(userRef, {
        following: isFollowing
          ? arrayRemove(userId)
          : arrayUnion(userId),
      })

      // Update the followed user's followers array
      const otherUserRef = doc(db, "users", userId)
      await updateDoc(otherUserRef, {
        followers: isFollowing
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
      })

      // Create notification when following (not when unfollowing)
      if (!isFollowing) {
        await createFollowNotification({
          followerId: user.uid,
          followerName: `${userData?.firstName} ${userData?.lastName}`,
          followerAvatar: userData?.profileImage,
          userId: userId,
        })
      }

      // Refresh user data to update UI
      await refreshUserData()
    } catch (error) {
      console.error("Error updating follow status:", error)
    }
  }

  const handleStartChat = async (userId: string) => {
    if (!user) return

    try {
      // Check if chat already exists
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      )
      const snapshot = await getDocs(chatsQuery)
      const existingChat = snapshot.docs.find(doc => {
        const data = doc.data()
        return data.participants.includes(userId)
      })

      if (existingChat) {
        router.push(`/chat?id=${existingChat.id}`)
        return
      }

      // Create new chat
      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [user.uid, userId],
        lastMessage: "",
        timestamp: serverTimestamp(),
        unreadCount: 0
      })

      router.push(`/chat?id=${chatRef.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
    const department = u.department?.toLowerCase() || ""
    const search = searchQuery.toLowerCase()

    return (
      fullName.includes(search) ||
      department.includes(search)
    )
  })

  if (!user || !userData) return null

  return (
    <Container>
      <div className="py-6 md:py-8">
        <PageHeader
          title="People"
          description="Connect with your peers"
        />

        <div className="mt-6 space-y-6">
          <Input
            placeholder="Search by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No users found matching your search"
                  : "No users found"}
              </p>
            </div>
          ) : (
            <CardGrid
              columns={{
                default: 1,
                sm: 2,
                lg: 3,
              }}
            >
              {filteredUsers.map((u) => (
                <UserCard
                  key={u.id}
                  name={`${u.firstName} ${u.lastName}`}
                  department={u.department}
                  year={u.year}
                  imageSrc={u.profileImage}
                  bio={u.bio}
                  vibe={u.vibe}
                  interests={u.interests}
                  onFollow={() => handleFollow(u.id)}
                  onChat={() => handleStartChat(u.id)}
                  onViewProfile={() => handleViewProfile(u.id)}
                  isFollowing={userData.following?.includes(u.id)}
                />
              ))}
            </CardGrid>
          )}
        </div>
      </div>
    </Container>
  )
} 