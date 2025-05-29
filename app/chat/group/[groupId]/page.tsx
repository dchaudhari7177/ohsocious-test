"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ImageIcon, Info, Paperclip, Send, Smile, Users } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Sample group data
const groups = {
  "1": {
    id: "1",
    name: "CS Study Group",
    avatar: "/placeholder.svg?height=40&width=40",
    description: "A group for discussing CS assignments and projects",
    members: [
      {
        id: "1",
        name: "Emma Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
      },
      {
        id: "2",
        name: "James Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "3",
        name: "Sophia Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "current-user",
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "4",
        name: "Marcus Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "5",
        name: "Olivia Martinez",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "6",
        name: "Ethan Park",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "7",
        name: "Ava Thompson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Campus Events Committee",
    avatar: "/placeholder.svg?height=40&width=40",
    description: "Planning and organizing campus events",
    members: [
      {
        id: "2",
        name: "James Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
      },
      {
        id: "current-user",
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "3",
        name: "Sophia Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "5",
        name: "Olivia Martinez",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "7",
        name: "Ava Thompson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "8",
        name: "Noah Garcia",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "9",
        name: "Isabella Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "10",
        name: "Liam Wright",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "11",
        name: "Mia Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "12",
        name: "Lucas Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Basketball Team",
    avatar: "/placeholder.svg?height=40&width=40",
    description: "Official group for the university basketball team",
    members: [
      {
        id: "4",
        name: "Marcus Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
      },
      {
        id: "current-user",
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "2",
        name: "James Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "6",
        name: "Ethan Park",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "8",
        name: "Noah Garcia",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "10",
        name: "Liam Wright",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "13",
        name: "William Davis",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "14",
        name: "Henry Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: "15",
        name: "Benjamin Moore",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
  },
}

// Sample message data
const initialMessages = {
  "1": [
    {
      id: "1",
      senderId: "1",
      senderName: "Emma Wilson",
      text: "Hey everyone! I created this group for us to discuss CS assignments and help each other out.",
      timestamp: "2 days ago",
    },
    {
      id: "2",
      senderId: "3",
      senderName: "Sophia Chen",
      text: "Great idea! I've been struggling with the latest algorithm assignment.",
      timestamp: "2 days ago",
    },
    {
      id: "3",
      senderId: "2",
      senderName: "James Rodriguez",
      text: "Same here. Maybe we could meet up at the library tomorrow?",
      timestamp: "2 days ago",
    },
    {
      id: "4",
      senderId: "1",
      senderName: "Emma Wilson",
      text: "That works for me. How about 4pm?",
      timestamp: "2 days ago",
    },
    {
      id: "5",
      senderId: "current-user",
      senderName: "You",
      text: "4pm works for me too!",
      timestamp: "2 days ago",
    },
    {
      id: "6",
      senderId: "1",
      senderName: "Emma Wilson",
      text: "I'll bring my notes on algorithms",
      timestamp: "5 min ago",
    },
  ],
  "2": [
    {
      id: "1",
      senderId: "2",
      senderName: "James Rodriguez",
      text: "Welcome to the Campus Events Committee group! We'll be planning all major campus events here.",
      timestamp: "1 week ago",
    },
    {
      id: "2",
      senderId: "5",
      senderName: "Olivia Martinez",
      text: "Excited to be part of this! When's our first event?",
      timestamp: "1 week ago",
    },
    {
      id: "3",
      senderId: "2",
      senderName: "James Rodriguez",
      text: "We're thinking of organizing a welcome party for freshmen next month.",
      timestamp: "1 week ago",
    },
    {
      id: "4",
      senderId: "current-user",
      senderName: "You",
      text: "That sounds great! I can help with decorations.",
      timestamp: "1 week ago",
    },
    {
      id: "5",
      senderId: "7",
      senderName: "Ava Thompson",
      text: "I can handle the music and entertainment!",
      timestamp: "1 week ago",
    },
    {
      id: "6",
      senderId: "2",
      senderName: "James Rodriguez",
      text: "The venue is confirmed for Friday",
      timestamp: "2 hours ago",
    },
  ],
  "3": [
    {
      id: "1",
      senderId: "4",
      senderName: "Marcus Johnson",
      text: "Welcome to the Basketball Team group chat! We'll use this for practice schedules and game announcements.",
      timestamp: "2 weeks ago",
    },
    {
      id: "2",
      senderId: "8",
      senderName: "Noah Garcia",
      text: "Looking forward to the season! When's our first practice?",
      timestamp: "2 weeks ago",
    },
    {
      id: "3",
      senderId: "4",
      senderName: "Marcus Johnson",
      text: "First practice is next Monday at 6pm in the main gym.",
      timestamp: "2 weeks ago",
    },
    {
      id: "4",
      senderId: "current-user",
      senderName: "You",
      text: "I'll be there! Should we bring anything specific?",
      timestamp: "2 weeks ago",
    },
    {
      id: "5",
      senderId: "4",
      senderName: "Marcus Johnson",
      text: "Just your regular practice gear and water bottle. We'll provide the rest.",
      timestamp: "2 weeks ago",
    },
    {
      id: "6",
      senderId: "4",
      senderName: "Marcus Johnson",
      text: "Practice at 6pm tomorrow",
      timestamp: "Yesterday",
    },
  ],
}

export default function GroupChatPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const group = groups[groupId as keyof typeof groups]

  const [messages, setMessages] = useState(initialMessages[groupId as keyof typeof initialMessages] || [])
  const [newMessage, setNewMessage] = useState("")
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: String(messages.length + 1),
      senderId: "current-user",
      senderName: "You",
      text: newMessage,
      timestamp: "Just now",
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  if (!group) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Group not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Chat header */}
      <div className="border-b bg-white p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/chat">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar>
              <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
              <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{group.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{group.members.length}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">{group.description}</p>
            </div>
            <Dialog open={showGroupInfo} onOpenChange={setShowGroupInfo}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Group Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                      <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.description}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Members ({group.members.length})</h4>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {group.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs capitalize text-gray-500">{member.role}</p>
                              </div>
                            </div>
                            {member.role === "admin" && (
                              <span className="rounded-full bg-primary-purple/10 px-2 py-1 text-xs text-primary-purple">
                                Admin
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-2xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
            >
              {message.senderId !== "current-user" && (
                <Avatar className="mr-2 h-8 w-8">
                  <AvatarImage
                    src={
                      group.members.find((m) => m.id === message.senderId)?.avatar ||
                      "/placeholder.svg?height=40&width=40" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={message.senderName}
                  />
                  <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === "current-user" ? "bg-primary-purple text-white" : "bg-white text-gray-800"
                }`}
              >
                {message.senderId !== "current-user" && (
                  <p className="mb-1 text-xs font-medium">{message.senderName}</p>
                )}
                <p>{message.text}</p>
                <div
                  className={`mt-1 text-right text-xs ${
                    message.senderId === "current-user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t bg-white p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <ImageIcon className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="relative flex-1">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="pr-10"
              />
              <Button variant="ghost" size="icon" className="absolute right-0 top-0">
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            <Button
              size="icon"
              className="bg-primary-purple hover:bg-primary-purple/90"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
