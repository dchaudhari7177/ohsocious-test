"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageSquare, Users, Bell, Calendar } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/contexts/notifications-context"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log("Current notifications:", notifications)
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "follow":
        return <Users className="h-4 w-4 text-primary-purple" />
      case "like":
        return <Heart className="h-4 w-4 text-secondary-pink" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications
    if (activeTab === "unread") return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === activeTab)
  }

  const handleNotificationClick = async (notificationId: string) => {
    try {
      setLoading(true)
      await markAsRead(notificationId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true)
      await markAllAsRead()
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
            variant={activeTab === "follow" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("follow")}
          >
            Follows
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={loading}
          >
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
            onClick={(e) => {
              if (loading) {
                e.preventDefault()
                return
              }
              handleNotificationClick(notification.id)
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{notification.senderName}</p>
                  <span className="text-sm text-gray-500">
                    {notification.createdAt?.toDate() 
                      ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })
                      : "Just now"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{notification.content}</p>
              </div>
            </div>
          </Link>
        ))}

        {getFilteredNotifications().length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">No notifications</p>
            <p className="text-sm text-gray-500">
              {activeTab === "all"
                ? "You don't have any notifications yet"
                : `You don't have any ${activeTab} notifications`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
