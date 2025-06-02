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
  try {
    await addDoc(collection(db, "notifications"), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error creating notification:", error)
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
  await createNotification({
    type: "follow",
    senderId: followerId,
    senderName: followerName,
    senderAvatar: followerAvatar,
    recipientId: userId,
    content: "started following you",
    link: `/profile/${followerId}`,
  })
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
  await createNotification({
    type: "message",
    senderId,
    senderName,
    senderAvatar,
    recipientId,
    content: "sent you a message",
    link: `/chat/${chatId}`,
  })
} 