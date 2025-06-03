"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageCircle, Users } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query as firestoreQuery, getDocs, orderBy, limit, where, DocumentData, addDoc, query, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  department: string
  profileImage?: string
  bio?: string
}

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  // Load initial users
  useEffect(() => {
    loadRecentUsers()
  }, [])

  const loadRecentUsers = async () => {
    setLoading(true)
    try {
      const usersRef = collection(db, "users")
      const recentUsersQuery = firestoreQuery(
        usersRef,
        orderBy("createdAt", "desc"),
        limit(10)
      )

      const snapshot = await getDocs(recentUsersQuery)
      const usersList: User[] = []

      snapshot.docs.forEach(doc => {
        if (doc.id !== currentUser?.uid) {
          const data = doc.data() as DocumentData
          usersList.push({
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            username: data.username || "",
            department: data.department || "",
            profileImage: data.profileImage,
            bio: data.bio
          })
        }
      })

      setUsers(usersList)
    } catch (error) {
      console.error("Error loading recent users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      loadRecentUsers()
      return
    }

    setLoading(true)
    try {
      const queryLower = query.toLowerCase()
      const usersRef = collection(db, "users")
      
      // Search by first name
      const firstNameQuery = firestoreQuery(
        usersRef,
        where("firstNameLower", ">=", queryLower),
        where("firstNameLower", "<=", queryLower + "\uf8ff"),
        limit(20)
      )

      // Search by last name
      const lastNameQuery = firestoreQuery(
        usersRef,
        where("lastNameLower", ">=", queryLower),
        where("lastNameLower", "<=", queryLower + "\uf8ff"),
        limit(20)
      )

      // Search by username
      const usernameQuery = firestoreQuery(
        usersRef,
        where("usernameLower", ">=", queryLower),
        where("usernameLower", "<=", queryLower + "\uf8ff"),
        limit(20)
      )

      const [firstNameResults, lastNameResults, usernameResults] = await Promise.all([
        getDocs(firstNameQuery),
        getDocs(lastNameQuery),
        getDocs(usernameQuery)
      ])

      const results = new Map<string, User>()

      const processResults = (snapshot: any) => {
        snapshot.docs.forEach((doc: any) => {
          if (doc.id !== currentUser?.uid) {
            const data = doc.data() as DocumentData
            results.set(doc.id, {
              id: doc.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              username: data.username || "",
              department: data.department || "",
              profileImage: data.profileImage,
              bio: data.bio
            })
          }
        })
      }

      processResults(firstNameResults)
      processResults(lastNameResults)
      processResults(usernameResults)

      setUsers(Array.from(results.values()))
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [searchQuery])

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return

    try {
      // Check if chat already exists
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUser.uid)
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
        participants: [currentUser.uid, userId],
        lastMessage: "",
        timestamp: serverTimestamp(),
        unreadCount: 0
      })

      router.push(`/chat?id=${chatRef.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewProfile(user.id)}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleStartChat(user.id)}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">No users found</p>
          <p className="text-sm text-gray-500">
            {searchQuery ? "Try a different search term" : "Recent users will appear here"}
          </p>
        </div>
      )}
    </div>
  )
} 