"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  DocumentData,
} from "firebase/firestore"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Container } from "@/components/ui/container"
import { MessageSquare, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ChatPreview {
  id: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  lastMessage: string
  timestamp: Date
  unreadCount: number
}

interface ChatData extends DocumentData {
  participants: string[]
  lastMessage: string
  timestamp: any
  unreadCount: number
}

interface UserData extends DocumentData {
  firstName: string
  lastName: string
  profileImage?: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return

    console.log("Setting up chats listener")

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("timestamp", "desc")
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log("Received chats update:", snapshot.docs.length, "chats")
      const chatPreviews: ChatPreview[] = []

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data() as ChatData
        const otherUserId = data.participants.find((id: string) => id !== user.uid)

        if (otherUserId) {
          const userDoc = await getDoc(doc(db, "users", otherUserId))
          const userData = userDoc.data() as UserData | undefined

          if (userData) {
            chatPreviews.push({
              id: docSnapshot.id,
              otherUser: {
                id: otherUserId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImage: userData.profileImage,
              },
              lastMessage: data.lastMessage || "No messages yet",
              timestamp: data.timestamp?.toDate() || new Date(),
              unreadCount: data.unreadCount || 0,
            })
          }
        }
      }

      setChats(chatPreviews)
      setLoading(false)
    })

    return () => {
      console.log("Cleaning up chats listener")
      unsubscribe()
    }
  }, [user])

  const filteredChats = chats.filter((chat) => {
    const fullName = `${chat.otherUser.firstName} ${chat.otherUser.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  if (!user) return null

  if (loading) {
    return (
      <Container>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Chat with your connections</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" asChild>
            <Link href="/people">
              <Users className="mr-2 h-4 w-4" />
              Find People
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <MessageSquare className="h-12 w-12 text-gray-400" />
              {searchQuery ? (
                <>
                  <h3 className="mt-4 text-lg font-medium">No conversations found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try searching with a different name
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-lg font-medium">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start a conversation with someone from the people page
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/people">
                      <Users className="mr-2 h-4 w-4" />
                      Find People
                    </Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat?id=${chat.id}`}
                className="group block overflow-hidden rounded-lg border bg-white transition-all hover:border-primary-purple hover:shadow-md"
              >
                <div className="flex items-start gap-4 p-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    {chat.otherUser.profileImage ? (
                      <AvatarImage
                        src={chat.otherUser.profileImage}
                        alt={`${chat.otherUser.firstName} ${chat.otherUser.lastName}`}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary-purple text-white">
                        {chat.otherUser.firstName[0]}
                        {chat.otherUser.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-purple">
                        {chat.otherUser.firstName} {chat.otherUser.lastName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-primary-purple hover:bg-primary-purple/90">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Container>
  )
} 