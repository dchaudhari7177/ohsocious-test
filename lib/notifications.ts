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

    // Create notification document data, excluding undefined values
    const notificationData = {
      type: data.type,
      senderId: data.senderId,
      senderName: data.senderName,
      recipientId: data.recipientId,
      content: data.content,
      link: data.link,
      read: false,
      createdAt: serverTimestamp(),
    }

    // Only add senderAvatar if it exists
    if (data.senderAvatar) {
      Object.assign(notificationData, { senderAvatar: data.senderAvatar })
    }

    const docRef = await addDoc(collection(db, "notifications"), notificationData)
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

    // Create notification data, only including followerAvatar if it exists
    const notificationData: NotificationData = {
      type: "follow",
      senderId: followerId,
      senderName: followerName,
      recipientId: userId,
      content: "started following you",
      link: `/profile/${followerId}`,
    }

    // Only add followerAvatar if it exists
    if (followerAvatar) {
      notificationData.senderAvatar = followerAvatar
    }

    return await createNotification(notificationData)
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

    // Create notification data, only including senderAvatar if it exists
    const notificationData: NotificationData = {
      type: "message",
      senderId,
      senderName,
      recipientId,
      content: "sent you a message",
      link: `/chat/${chatId}`,
    }

    // Only add senderAvatar if it exists
    if (senderAvatar) {
      notificationData.senderAvatar = senderAvatar
    }

    return await createNotification(notificationData)
  } catch (error) {
    console.error("Error creating message notification:", error)
    throw error
  }
} 