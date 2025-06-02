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
  participants: string[]
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

    console.log("Setting up unread messages listener for user:", user.uid)

    const unreadQuery = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      where("receiverId", "==", user.uid),
      where("read", "==", false)
    )

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      console.log("Unread messages count:", snapshot.docs.length)
      setUnreadCount(snapshot.docs.length)
    }, (error) => {
      console.error("Error in unread messages listener:", error)
    })

    return () => {
      console.log("Cleaning up unread messages listener")
      unsubscribe()
    }
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

    console.log("Loading chat history with user:", otherUserId)

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
      console.log("Chat messages snapshot received:", snapshot.docs.length, "messages")
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
            participants: data.participants || [data.senderId, data.receiverId],
          })
        }
      })
      console.log("Filtered chat messages:", chatMessages.length)
      setMessages(chatMessages)
    }, (error) => {
      console.error("Error in chat messages listener:", error)
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

    console.log("Sending message to user:", receiverId)
    try {
      // Add message to Firestore
      const messageRef = await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId,
        content,
        timestamp: serverTimestamp(),
        read: false,
        participants: [user.uid, receiverId], // Add participants array for permissions
      })
      console.log("Message created with ID:", messageRef.id)

      // Create notification for the recipient
      await createMessageNotification({
        senderId: user.uid,
        senderName: `${userData.firstName} ${userData.lastName}`,
        senderAvatar: userData.profileImage,
        recipientId: receiverId,
        chatId: receiverId, // Using receiverId as chatId for direct messages
      })
      console.log("Message notification created successfully")
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