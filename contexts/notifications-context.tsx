"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"

interface Notification {
  id: string
  type: "message" | "follow" | "like" | "comment"
  senderId: string
  senderName: string
  senderAvatar?: string
  recipientId: string
  content: string
  read: boolean
  link: string
  createdAt: any
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  createNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  createNotification: async () => {},
})

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }

    console.log("Setting up notifications listener for user:", user.uid)

    // Subscribe to notifications for the current user
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Notifications snapshot received:", snapshot.docs.length, "notifications")
      const newNotifications = snapshot.docs.map((doc) => {
        const data = doc.data()
        console.log("Notification data:", { id: doc.id, ...data })
        return {
          id: doc.id,
          ...data,
        }
      }) as Notification[]
      setNotifications(newNotifications)
    }, (error) => {
      console.error("Error in notifications listener:", error)
    })

    return () => {
      console.log("Cleaning up notifications listener")
      unsubscribe()
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (notificationId: string) => {
    if (!user) return
    console.log("Marking notification as read:", notificationId)
    try {
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, { read: true })
      console.log("Successfully marked notification as read")
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    console.log("Marking all notifications as read")
    try {
      const promises = notifications
        .filter((n) => !n.read)
        .map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }))
      await Promise.all(promises)
      console.log("Successfully marked all notifications as read")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!user) return
    console.log("Deleting notification:", notificationId)
    try {
      await deleteDoc(doc(db, "notifications", notificationId))
      console.log("Successfully deleted notification")
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const createNotification = async (
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ) => {
    if (!user) return
    console.log("Creating new notification:", notification)
    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
      })
      console.log("Successfully created notification with ID:", docRef.id)
    } catch (error) {
      console.error("Error creating notification:", error)
    }
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
} 