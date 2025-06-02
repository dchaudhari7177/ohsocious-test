"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface ChatUser {
  firstName: string
  lastName: string
  profileImage?: string
}

export default function ChatPage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const { messages, sendMessage, loadChatHistory } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchChatUser = async () => {
      if (!userId || typeof userId !== "string") return

      try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setChatUser({
            firstName: data.firstName,
            lastName: data.lastName,
            profileImage: data.profileImage,
          })
        }
      } catch (error) {
        console.error("Error fetching chat user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatUser()
  }, [userId])

  useEffect(() => {
    if (typeof userId === "string") {
      loadChatHistory(userId)
    }
  }, [userId, loadChatHistory])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId || typeof userId !== "string" || loading) return

    try {
      console.log("Starting to send message to:", userId)
      setLoading(true)
      await sendMessage(userId, newMessage.trim())
      console.log("Message sent successfully")
      setNewMessage("")
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  if (!chatUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {chatUser.profileImage ? (
              <AvatarImage src={chatUser.profileImage} alt={`${chatUser.firstName} ${chatUser.lastName}`} />
            ) : (
              <AvatarFallback>
                {chatUser.firstName[0]}
                {chatUser.lastName[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {chatUser.firstName} {chatUser.lastName}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === user?.uid
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-primary-purple text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isCurrentUser ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {format(message.timestamp, "h:mm a")}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={!newMessage.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
