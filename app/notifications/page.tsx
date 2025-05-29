"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageSquare, Users, Bell, Calendar } from "lucide-react"
import Link from "next/link"

// Sample notification data
const allNotifications = [
  {
    id: "1",
    type: "message",
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "sent you a message",
    timestamp: "2 min ago",
    read: false,
    link: "/chat/1",
  },
  {
    id: "2",
    type: "connection",
    user: {
      name: "James Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "accepted your connection request",
    timestamp: "1 hour ago",
    read: false,
    link: "/profile/2",
  },
  {
    id: "3",
    type: "like",
    user: {
      name: "Sophia Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "liked your post about the campus event",
    timestamp: "3 hours ago",
    read: false,
    link: "/feed",
  },
  {
    id: "4",
    type: "group",
    user: {
      name: "CS Study Group",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Emma Wilson posted in the group",
    timestamp: "5 hours ago",
    read: true,
    link: "/chat/group/1",
  },
  {
    id: "5",
    type: "event",
    user: {
      name: "Campus Events Committee",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "New event: Welcome Party on Friday",
    timestamp: "Yesterday",
    read: true,
    link: "/events",
  },
  {
    id: "6",
    type: "message",
    user: {
      name: "Marcus Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "replied to your message",
    timestamp: "Yesterday",
    read: true,
    link: "/chat/4",
  },
  {
    id: "7",
    type: "connection",
    user: {
      name: "Olivia Martinez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "sent you a connection request",
    timestamp: "2 days ago",
    read: true,
    link: "/profile/5",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications
    if (activeTab === "unread") return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === activeTab)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "connection":
        return <Users className="h-4 w-4 text-primary-purple" />
      case "like":
        return <Heart className="h-4 w-4 text-secondary-pink" />
      case "group":
        return <Users className="h-4 w-4 text-green-500" />
      case "event":
        return <Calendar className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feed">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
          >
            All
          </Button>
          <Button
            variant={activeTab === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </Button>
          <Button
            variant={activeTab === "message" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("message")}
          >
            Messages
          </Button>
          <Button
            variant={activeTab === "connection" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("connection")}
          >
            Connections
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {getFilteredNotifications().map((notification) => (
          <Link
            key={notification.id}
            href={notification.link}
            className={`block rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
              !notification.read ? "bg-blue-50" : ""
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{notification.user.name}</p>
                  <span className="text-sm text-gray-500">{notification.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600">{notification.content}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
