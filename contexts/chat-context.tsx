"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, DocumentData } from "firebase/firestore"
import { useAuth } from "./auth-context"
import { createMessageNotification } from "@/lib/notifications"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

interface ChatContextType {
  messages: Message[]
  sendMessage: (receiverId: string, content: string) => Promise<void>
  loadChatHistory: (otherUserId: string) => void
  unreadCount: number
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: async () => {},
  loadChatHistory: () => {},
  unreadCount: 0,
})

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, userData } = useAuth()
  const [currentChatUser, setCurrentChatUser] = useState<string | null>(null)
  const chatUnsubscribeRef = useRef<(() => void) | null>(null)

  // Listen for unread messages count
  useEffect(() => {
    if (!user) return

    const unreadQuery = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      where("read", "==", false)
    )

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      setUnreadCount(snapshot.docs.length)
    })

    return () => unsubscribe()
  }, [user])

  // Cleanup function for chat subscription
  const cleanupChatSubscription = useCallback(() => {
    if (chatUnsubscribeRef.current) {
      chatUnsubscribeRef.current()
      chatUnsubscribeRef.current = null
    }
  }, [])

  // Load chat history with proper cleanup
  const loadChatHistory = useCallback((otherUserId: string) => {
    if (!user) return

    // Clean up previous subscription
    cleanupChatSubscription()
    
    setCurrentChatUser(otherUserId)

    // Query messages between current user and other user
    const chatQuery = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("timestamp", "asc")
    )

    chatUnsubscribeRef.current = onSnapshot(chatQuery, (snapshot) => {
      const chatMessages: Message[] = []
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as DocumentData
        // Only include messages between these two users
        if (
          (data.senderId === user.uid && data.receiverId === otherUserId) ||
          (data.senderId === otherUserId && data.receiverId === user.uid)
        ) {
          chatMessages.push({
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
            read: data.read || false,
          })
        }
      })
      setMessages(chatMessages)
    })
  }, [user, cleanupChatSubscription])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupChatSubscription()
    }
  }, [cleanupChatSubscription])

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !userData) return

    try {
      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId,
        content,
        timestamp: serverTimestamp(),
        read: false,
        participants: [user.uid, receiverId], // Add this array for easier querying
      })

      // Create notification for the recipient
      await createMessageNotification({
        senderId: user.uid,
        senderName: `${userData.firstName} ${userData.lastName}`,
        senderAvatar: userData.profileImage,
        recipientId: receiverId,
        chatId: receiverId, // Using receiverId as chatId for direct messages
      })
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }, [user, userData])

  return (
    <ChatContext.Provider value={{ messages, sendMessage, loadChatHistory, unreadCount }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
} 