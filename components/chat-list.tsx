import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import Link from "next/link"

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: number
  members?: number
}

interface ChatListProps {
  chats: Chat[]
  type: "direct" | "group"
}

export function ChatList({ chats, type }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-center text-gray-500">No conversations found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={type === "direct" ? `/chat/${chat.id}` : `/chat/group/${chat.id}`}
          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
        >
          <Avatar>
            <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-medium">{chat.name}</p>
                {type === "group" && chat.members && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{chat.members}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{chat.timestamp}</p>
            </div>
            <p className="truncate text-sm text-gray-600">{chat.lastMessage}</p>
          </div>
          {chat.unread > 0 && <Badge className="bg-primary-purple hover:bg-primary-purple/90">{chat.unread}</Badge>}
        </Link>
      ))}
    </div>
  )
}
