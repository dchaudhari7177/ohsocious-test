"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Image as ImageIcon, Paperclip, Smile } from "lucide-react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface ChatUser {
  firstName: string
  lastName: string
  profileImage?: string
  department?: string
  year?: string
}

export default function ChatPage() {
  const { userId } = useParams()
  const router = useRouter()
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
            department: data.department,
            year: data.year,
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId || typeof userId !== "string" || loading) return

    try {
      setLoading(true)
      await sendMessage(userId, newMessage.trim())
      setNewMessage("")
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
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-gray-500">User not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="mr-1" asChild>
            <Link href="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-10 w-10">
            {chatUser.profileImage ? (
              <AvatarImage src={chatUser.profileImage} alt={`${chatUser.firstName} ${chatUser.lastName}`} />
            ) : (
              <AvatarFallback className="bg-primary-purple text-white">
                {chatUser.firstName[0]}
                {chatUser.lastName[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">
              {chatUser.firstName} {chatUser.lastName}
            </h2>
            {chatUser.department && chatUser.year && (
              <p className="text-sm text-gray-500">
                {chatUser.department} • {chatUser.year}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-purple/10">
                <Send className="h-8 w-8 text-primary-purple" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">No messages yet</h3>
              <p className="text-sm text-gray-500">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.senderId === user?.uid
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] space-y-1 rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? "bg-primary-purple text-white"
                        : "bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    <p className="break-words text-sm">{message.content}</p>
                    <p
                      className={`text-right text-xs ${
                        isCurrentUser ? "text-white/70" : "text-gray-500"
                      }`}
                    >
                      {format(message.timestamp, "h:mm a")}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <ImageIcon className="h-5 w-5 text-gray-500" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              disabled={!newMessage.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
