import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface NotificationData {
  type: "message" | "follow" | "like" | "comment"
  senderId: string
  senderName: string
  senderAvatar?: string
  recipientId: string
  content: string
  link: string
}

export async function createNotification(data: NotificationData) {
  console.log("Creating notification with data:", data)
  try {
    // Validate required fields
    if (!data.senderId || !data.recipientId || !data.type || !data.content) {
      throw new Error("Missing required notification fields")
    }

    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    })
    console.log("Successfully created notification with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function createFollowNotification({
  followerId,
  followerName,
  followerAvatar,
  userId,
}: {
  followerId: string
  followerName: string
  followerAvatar?: string
  userId: string
}) {
  console.log("Creating follow notification:", { followerId, followerName, userId })
  try {
    if (!followerId || !followerName || !userId) {
      throw new Error("Missing required follow notification fields")
    }

    return await createNotification({
      type: "follow",
      senderId: followerId,
      senderName: followerName,
      senderAvatar: followerAvatar,
      recipientId: userId,
      content: "started following you",
      link: `/profile/${followerId}`,
    })
  } catch (error) {
    console.error("Error creating follow notification:", error)
    throw error
  }
}

export async function createMessageNotification({
  senderId,
  senderName,
  senderAvatar,
  recipientId,
  chatId,
}: {
  senderId: string
  senderName: string
  senderAvatar?: string
  recipientId: string
  chatId: string
}) {
  console.log("Creating message notification:", { senderId, senderName, recipientId, chatId })
  try {
    if (!senderId || !senderName || !recipientId || !chatId) {
      throw new Error("Missing required message notification fields")
    }

    return await createNotification({
      type: "message",
      senderId,
      senderName,
      senderAvatar,
      recipientId,
      content: "sent you a message",
      link: `/chat/${chatId}`,
    })
  } catch (error) {
    console.error("Error creating message notification:", error)
    throw error
  }
} 