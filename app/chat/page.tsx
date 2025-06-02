"use client"

import { useState, useEffect } from "react"
import { UserSearch } from "@/components/user-search"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, DocumentData, doc, getDoc, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface RecentChat {
  userId: string
  firstName: string
  lastName: string
  username: string
  profileImage?: string
  lastMessage: string
  timestamp: Date
  unread: boolean
}

export default function ChatPage() {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { unreadCount } = useChat()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get recent messages where user is a participant
        const messagesQuery = query(
          collection(db, "messages"),
          where("participants", "array-contains", user.uid),
          orderBy("timestamp", "desc"),
          orderBy("__name__", "desc"), // Add this to match the index
          limit(50) // Fetch more to account for different conversations
        )

        const messagesSnapshot = await getDocs(messagesQuery)
        const processedUsers = new Set<string>()
        const recentChatsMap = new Map<string, RecentChat>()

        for (const messageDoc of messagesSnapshot.docs) {
          const message = messageDoc.data()
          if (!message.timestamp) continue // Skip messages without timestamp

          const otherUserId = message.senderId === user.uid ? message.receiverId : message.senderId

          if (!processedUsers.has(otherUserId)) {
            processedUsers.add(otherUserId)

            try {
              // Get user details
              const userDoc = await getDoc(doc(db, "users", otherUserId))
              
              if (userDoc.exists()) {
                const userData = userDoc.data()
                recentChatsMap.set(otherUserId, {
                  userId: otherUserId,
                  firstName: userData.firstName || "",
                  lastName: userData.lastName || "",
                  username: userData.username || "",
                  profileImage: userData.profileImage,
                  lastMessage: message.content,
                  timestamp: message.timestamp.toDate(),
                  unread: !message.read && message.receiverId === user.uid
                })

                // Break if we have enough recent chats
                if (recentChatsMap.size >= 10) break
              }
            } catch (error) {
              console.error(`Error fetching user ${otherUserId}:`, error)
            }
          }
        }

        setRecentChats(Array.from(recentChatsMap.values()))
      } catch (error) {
        console.error("Error fetching recent chats:", error)
        toast({
          variant: "destructive",
          title: "Error loading chats",
          description: "Please try refreshing the page."
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecentChats()
  }, [user, unreadCount, toast])

  const handleChatSelect = (userId: string) => {
    router.push(`/chat/${userId}`)
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      {/* User Search */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Find People</h2>
        <UserSearch />
      </div>

      {/* Recent Chats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Conversations</h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <Card
                key={chat.userId}
                className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                  chat.unread ? "bg-gray-50" : ""
                }`}
                onClick={() => handleChatSelect(chat.userId)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {chat.profileImage ? (
                      <AvatarImage src={chat.profileImage} alt={`${chat.firstName} ${chat.lastName}`} />
                    ) : (
                      <AvatarFallback>
                        {chat.firstName[0]}
                        {chat.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {chat.firstName} {chat.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(chat.timestamp, "MMM d, h:mm a")}
                      </p>
                    </div>
                    <p className={`text-sm ${chat.unread ? "font-medium text-gray-900" : "text-gray-500"}`}>
                      {chat.lastMessage.length > 50
                        ? chat.lastMessage.substring(0, 50) + "..."
                        : chat.lastMessage}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {!loading && recentChats.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-gray-500">No recent conversations</p>
                <p className="mt-1 text-sm text-gray-400">
                  Use the search above to find people and start chatting
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
