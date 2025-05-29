"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ImageIcon, Paperclip, Send, Smile } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Sample user data
const users = {
  "1": {
    id: "1",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    department: "Computer Science",
  },
  "2": {
    id: "2",
    name: "James Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    department: "Business",
  },
  "3": {
    id: "3",
    name: "Sophia Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    department: "Psychology",
  },
  "4": {
    id: "4",
    name: "Marcus Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    department: "Engineering",
  },
}

// Sample message data
const initialMessages = {
  "1": [
    {
      id: "1",
      senderId: "1",
      text: "Hey there! How's your day going?",
      timestamp: "10:30 AM",
      status: "read",
    },
    {
      id: "2",
      senderId: "current-user",
      text: "Hi Emma! It's going well, just working on that project for CS class. How about you?",
      timestamp: "10:32 AM",
      status: "read",
    },
    {
      id: "3",
      senderId: "1",
      text: "Same here! I'm stuck on that algorithm problem though. Would you be free to study together later?",
      timestamp: "10:35 AM",
      status: "read",
    },
    {
      id: "4",
      senderId: "current-user",
      text: "Definitely! How about the library at 4pm?",
      timestamp: "10:36 AM",
      status: "read",
    },
    {
      id: "5",
      senderId: "1",
      text: "Perfect! I'll bring my notes. See you then!",
      timestamp: "10:38 AM",
      status: "read",
    },
  ],
  "2": [
    {
      id: "1",
      senderId: "2",
      text: "Hey, did you get a chance to look at the business case study?",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: "2",
      senderId: "current-user",
      text: "Yes, I went through it. It's quite interesting!",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: "3",
      senderId: "2",
      text: "Great! I was thinking we could focus on the marketing strategy section for our presentation.",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: "4",
      senderId: "current-user",
      text: "Sounds good to me. I've already made some notes on that part.",
      timestamp: "Yesterday",
      status: "read",
    },
    {
      id: "5",
      senderId: "2",
      text: "Perfect! Thanks for sharing your notes!",
      timestamp: "Yesterday",
      status: "read",
    },
  ],
  "3": [
    {
      id: "1",
      senderId: "3",
      text: "Did you hear about the psychology department's research opportunity?",
      timestamp: "Monday",
      status: "read",
    },
    {
      id: "2",
      senderId: "current-user",
      text: "No, I haven't! Tell me more about it.",
      timestamp: "Monday",
      status: "read",
    },
    {
      id: "3",
      senderId: "3",
      text: "They're looking for volunteers for a study on cognitive development. I thought you might be interested!",
      timestamp: "Monday",
      status: "read",
    },
    {
      id: "4",
      senderId: "current-user",
      text: "That sounds fascinating! When does it start?",
      timestamp: "Monday",
      status: "read",
    },
    {
      id: "5",
      senderId: "3",
      text: "Next week! I'll send you the link to sign up.",
      timestamp: "Monday",
      status: "read",
    },
    {
      id: "6",
      senderId: "3",
      text: "Did you see the assignment deadline got extended?",
      timestamp: "3 hours ago",
      status: "delivered",
    },
  ],
  "4": [
    {
      id: "1",
      senderId: "4",
      text: "Hey, I'm putting together a team for the engineering hackathon. Would you be interested in joining?",
      timestamp: "Last week",
      status: "read",
    },
    {
      id: "2",
      senderId: "current-user",
      text: "That sounds awesome! What kind of project are you thinking of?",
      timestamp: "Last week",
      status: "read",
    },
    {
      id: "3",
      senderId: "4",
      text: "I was thinking something with renewable energy - maybe a solar-powered charging station for campus?",
      timestamp: "Last week",
      status: "read",
    },
    {
      id: "4",
      senderId: "current-user",
      text: "I love that idea! Count me in.",
      timestamp: "Last week",
      status: "read",
    },
    {
      id: "5",
      senderId: "4",
      text: "Great! Let me know when you're free to discuss the project",
      timestamp: "Yesterday",
      status: "delivered",
    },
  ],
}

export default function ChatPage() {
  const params = useParams()
  const userId = params.userId as string
  const user = users[userId as keyof typeof users]

  const [messages, setMessages] = useState(initialMessages[userId as keyof typeof initialMessages] || [])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
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
      text: newMessage,
      timestamp: "Just now",
      status: "sent",
    }

    setMessages([...messages, newMsg])
    setNewMessage("")

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true)

      // Simulate reply after typing
      setTimeout(() => {
        setIsTyping(false)

        const reply = {
          id: String(messages.length + 2),
          senderId: userId,
          text: getRandomReply(),
          timestamp: "Just now",
          status: "delivered",
        }

        setMessages((prev) => [...prev, reply])
      }, 3000)
    }, 1000)
  }

  const getRandomReply = () => {
    const replies = [
      "That's interesting!",
      "I see what you mean.",
      "Let me think about that.",
      "Good point!",
      "I agree with you.",
      "Thanks for sharing that.",
      "I'll get back to you on that soon.",
      "Let's discuss this more later.",
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>User not found</p>
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
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.name}</p>
                <div
                  className={`h-2 w-2 rounded-full ${user.status === "online" ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{user.department}</p>
            </div>
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
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === "current-user" ? "bg-primary-purple text-white" : "bg-white text-gray-800"
                }`}
              >
                <p>{message.text}</p>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                    message.senderId === "current-user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  <span>{message.timestamp}</span>
                  {message.senderId === "current-user" && (
                    <span>
                      {message.status === "sent" && "✓"}
                      {message.status === "delivered" && "✓✓"}
                      {message.status === "read" && <span className="text-blue-300">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <Avatar className="mr-2 h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] rounded-lg bg-white p-3 text-gray-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

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
