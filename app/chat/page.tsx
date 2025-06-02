"use client"

import { useState, useEffect, useRef } from "react"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { Loader2, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: any
  sender?: {
    name: string
    avatar: string
  }
}

interface Chat {
  id: string
  participants: string[]
  lastMessage: string
  timestamp: any
  unreadCount: number
  user: {
    name: string
    avatar: string
    department: string
  }
}

interface FirestoreUser {
  userId: string
  firstName: string
  lastName: string
  department: string
  profileImage?: string
}

interface FirestoreChat {
  participants: string[]
  lastMessage: string
  timestamp: any
  unreadCount: number
}

interface FirestoreMessage {
  chatId: string
  content: string
  senderId: string
  timestamp: any
}

export default function ChatPage() {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chats
  useEffect(() => {
    if (!user) return

    const fetchChats = async () => {
      try {
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid),
          orderBy("timestamp", "desc")
        )

        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatsData = await Promise.all(
            snapshot.docs.map(async (chatDoc) => {
              const data = chatDoc.data() as FirestoreChat
              const otherUserId = data.participants.find(
                (id) => id !== user.uid
              )
              if (!otherUserId) return null

              const userDocRef = doc(db, "users", otherUserId)
              const userDocSnap = await getDoc(userDocRef)
              const userData = userDocSnap.data() as FirestoreUser | undefined

              if (!userData) return null

              return {
                id: chatDoc.id,
                participants: data.participants,
                lastMessage: data.lastMessage,
                timestamp: data.timestamp,
                unreadCount: data.unreadCount,
                user: {
                  name: `${userData.firstName} ${userData.lastName}`,
                  avatar: userData.profileImage || "",
                  department: userData.department || "",
                },
              } as Chat
            })
          )

          const validChats = chatsData.filter((chat): chat is Chat => chat !== null)
          setChats(validChats)
          
          // If there's a chat ID in the URL, select that chat
          const params = new URLSearchParams(window.location.search)
          const chatId = params.get("id")
          if (chatId) {
            const selectedChat = validChats.find(chat => chat.id === chatId)
            if (selectedChat) {
              setSelectedChat(selectedChat)
            }
          }
          
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Error fetching chats:", error)
        setLoading(false)
      }
    }

    fetchChats()
  }, [user])

  // Subscribe to messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return

    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", selectedChat.id),
      orderBy("timestamp", "asc")
    )

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const messagesData = await Promise.all(
        snapshot.docs.map(async (messageDoc) => {
          const data = messageDoc.data() as FirestoreMessage
          const userDocRef = doc(db, "users", data.senderId)
          const userDocSnap = await getDoc(userDocRef)
          const userData = userDocSnap.data() as FirestoreUser | undefined

          if (!userData) return null

          return {
            id: messageDoc.id,
            content: data.content,
            senderId: data.senderId,
            timestamp: data.timestamp,
            sender: {
              name: `${userData.firstName} ${userData.lastName}`,
              avatar: userData.profileImage || "",
            },
          } as Message
        })
      )

      const validMessages = messagesData.filter((msg): msg is Message => msg !== null)
      setMessages(validMessages)
    })

    return () => unsubscribe()
  }, [selectedChat])

  const createChat = async (currentUserId: string, otherUserId: string) => {
    try {
      // Check if chat already exists
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUserId)
      )
      const snapshot = await getDocs(chatsQuery)
      const existingChat = snapshot.docs.find(chatDoc => {
        const data = chatDoc.data()
        return data.participants.includes(otherUserId)
      })

      if (existingChat) {
        return existingChat.id
      }

      // Create new chat
      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [currentUserId, otherUserId],
        lastMessage: "",
        timestamp: serverTimestamp(),
        unreadCount: 0
      })

      return chatRef.id
    } catch (error) {
      console.error("Error creating chat:", error)
      throw error
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedChat || !messageInput.trim()) return

    try {
      setSending(true)
      
      // Create message
      const messageRef = await addDoc(collection(db, "messages"), {
        chatId: selectedChat.id,
        content: messageInput,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      })

      // Update chat's last message and timestamp
      await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessage: messageInput,
        timestamp: serverTimestamp(),
      })

      setMessageInput("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleStartChat = async (userId: string) => {
    if (!user) return

    try {
      setLoading(true)
      const chatId = await createChat(user.uid, userId)
      const chatDoc = await getDoc(doc(db, "chats", chatId))
      const chatData = chatDoc.data()
      
      if (chatData) {
        const otherUserId = chatData.participants.find((id: string) => id !== user.uid)
        const userDoc = await getDoc(doc(db, "users", otherUserId))
        const userData = userDoc.data()

        setSelectedChat({
          id: chatId,
          ...chatData,
          user: {
            name: `${userData?.firstName} ${userData?.lastName}`,
            avatar: userData?.profileImage || "",
            department: userData?.department || "",
          },
        } as Chat)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !userData) return null

  return (
    <Container>
      <div className="py-6 md:py-8">
        <PageHeader title="Messages" description="Chat with your peers" />

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Chat List */}
          <Card className="col-span-1 h-[calc(100vh-12rem)] overflow-hidden md:block">
            <div className="flex h-full flex-col">
              <div className="p-4">
                <Input placeholder="Search chats..." />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
                  </div>
                ) : chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-gray-500">No chats yet</p>
                    <Button className="mt-4" variant="outline">
                      Start a Chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100",
                          selectedChat?.id === chat.id && "bg-gray-100"
                        )}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <Avatar>
                          <AvatarImage src={chat.user.avatar} />
                          <AvatarFallback>
                            {chat.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium">{chat.user.name}</p>
                          <p className="truncate text-sm text-gray-500">
                            {chat.lastMessage}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-purple text-xs text-white">
                            {chat.unreadCount}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="col-span-1 h-[calc(100vh-12rem)] overflow-hidden md:col-span-2 lg:col-span-3">
            {selectedChat ? (
              <div className="flex h-full flex-col">
                {/* Chat Header */}
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedChat.user.avatar} />
                      <AvatarFallback>
                        {selectedChat.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedChat.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedChat.user.department}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end gap-2",
                          message.senderId === user.uid && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.sender?.avatar} />
                          <AvatarFallback>
                            {message.sender?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            message.senderId === user.uid
                              ? "bg-primary-purple text-white"
                              : "bg-gray-100"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !messageInput.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold">No chat selected</h3>
                <p className="text-sm text-gray-500">
                  Select a chat from the list to start messaging
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  )
}
