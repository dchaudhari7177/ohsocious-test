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

  useEffect(() => {
    if (!user) return

    console.log("Setting up chats listener")

    // Query chats where the current user is a participant
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
          // Fetch other user's data
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
        <h1 className="mb-2 text-2xl font-bold">Messages</h1>
        <p className="text-gray-500">Chat with your connections</p>

        <div className="mt-6 space-y-4">
          {chats.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start a conversation with someone from the people page
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.otherUser.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    {chat.otherUser.profileImage ? (
                      <AvatarImage
                        src={chat.otherUser.profileImage}
                        alt={`${chat.otherUser.firstName} ${chat.otherUser.lastName}`}
                      />
                    ) : (
                      <AvatarFallback>
                        {chat.otherUser.firstName[0]}
                        {chat.otherUser.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {chat.otherUser.firstName} {chat.otherUser.lastName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-purple text-xs text-white">
                        {chat.unreadCount}
                      </span>
                    )}
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