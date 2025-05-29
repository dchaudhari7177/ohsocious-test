"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatList } from "@/components/chat-list"
import { Plus, Search, Users, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

// Sample data for chats
const directChats = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey, are you coming to the study group tonight?",
    timestamp: "2 min ago",
    unread: 2,
  },
  {
    id: "2",
    name: "James Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for sharing your notes!",
    timestamp: "1 hour ago",
    unread: 0,
  },
  {
    id: "3",
    name: "Sophia Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Did you see the assignment deadline got extended?",
    timestamp: "3 hours ago",
    unread: 1,
  },
  {
    id: "4",
    name: "Marcus Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Let me know when you're free to discuss the project",
    timestamp: "Yesterday",
    unread: 0,
  },
]

const groupChats = [
  {
    id: "1",
    name: "CS Study Group",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Emma: I'll bring my notes on algorithms",
    timestamp: "5 min ago",
    unread: 3,
    members: 8,
  },
  {
    id: "2",
    name: "Campus Events Committee",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "James: The venue is confirmed for Friday",
    timestamp: "2 hours ago",
    unread: 0,
    members: 12,
  },
  {
    id: "3",
    name: "Basketball Team",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Coach: Practice at 6pm tomorrow",
    timestamp: "Yesterday",
    unread: 0,
    members: 15,
  },
]

// Sample data for contacts
const contacts = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Computer Science",
  },
  {
    id: "2",
    name: "James Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Business",
  },
  {
    id: "3",
    name: "Sophia Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Psychology",
  },
  {
    id: "4",
    name: "Marcus Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Engineering",
  },
  {
    id: "5",
    name: "Olivia Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Art & Design",
  },
  {
    id: "6",
    name: "Ethan Park",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Computer Science",
  },
  {
    id: "7",
    name: "Ava Thompson",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Medicine",
  },
  {
    id: "8",
    name: "Noah Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Physics",
  },
]

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("direct")
  const [searchQuery, setSearchQuery] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const filteredDirectChats = directChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredGroupChats = groupChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleContactSelection = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId))
    } else {
      setSelectedContacts([...selectedContacts, contactId])
    }
  }

  const createNewGroup = () => {
    // In a real app, this would create a new group chat
    console.log("Creating new group:", {
      name: newGroupName,
      members: selectedContacts,
    })

    // Reset form
    setNewGroupName("")
    setSelectedContacts([])
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Back Button */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feed">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-lg font-semibold text-gray-700">Messages</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600">Chat with your campus connections</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary-purple hover:bg-primary-purple/90">
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="direct" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct">Direct Message</TabsTrigger>
                <TabsTrigger value="group">Group Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="mt-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => (
                      <Link
                        key={contact.id}
                        href={`/chat/${contact.id}`}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
                      >
                        <Avatar>
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.department}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="group" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="group-name" className="mb-2 block text-sm font-medium">
                      Group Name
                    </label>
                    <Input
                      id="group-name"
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Add Members</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search contacts..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {selectedContacts.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Selected ({selectedContacts.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedContacts.map((contactId) => {
                          const contact = contacts.find((c) => c.id === contactId)
                          if (!contact) return null
                          return (
                            <div
                              key={contact.id}
                              className="flex items-center gap-1 rounded-full bg-primary-purple/10 px-3 py-1 text-xs text-primary-purple"
                            >
                              {contact.name}
                              <button
                                onClick={() => toggleContactSelection(contact.id)}
                                className="ml-1 rounded-full p-0.5 hover:bg-primary-purple/20"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
                          onClick={() => toggleContactSelection(contact.id)}
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white">
                            {selectedContacts.includes(contact.id) && (
                              <div className="h-3 w-3 rounded-sm bg-primary-purple"></div>
                            )}
                          </div>
                          <Avatar>
                            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.department}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Button
                    className="w-full bg-primary-purple hover:bg-primary-purple/90"
                    disabled={!newGroupName || selectedContacts.length < 2}
                    onClick={createNewGroup}
                  >
                    <Users className="mr-2 h-4 w-4" /> Create Group Chat
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search messages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="direct" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct">Direct Messages</TabsTrigger>
          <TabsTrigger value="group">Group Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="mt-4">
          <ChatList chats={filteredDirectChats} type="direct" />
        </TabsContent>

        <TabsContent value="group" className="mt-4">
          <ChatList chats={filteredGroupChats} type="group" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
