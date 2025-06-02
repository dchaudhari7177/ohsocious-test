"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Timestamp } from "firebase/firestore"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Post {
  id: string
  userId: string
  content: string
  createdAt: Timestamp
  image?: string
  likes: number
  comments: number
  type: "normal" | "confession" | "poll"
  reactions: Record<string, number>
  timestamp: string
  user?: {
    name: string
    avatar: string
    department: string
  }
  anonymousName?: string
  anonymousAvatar?: string
}

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(post.id)
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              {post.type === "normal" && post.user?.avatar ? (
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
              ) : (
                <AvatarFallback>
                  {post.type === "normal"
                    ? post.user?.name.charAt(0)
                    : post.anonymousAvatar || "👻"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium">
                {post.type === "normal"
                  ? post.user?.name
                  : post.anonymousName || "Anonymous"}
              </p>
              {post.type === "normal" && post.user?.department && (
                <p className="text-sm text-gray-500">{post.user.department}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
            <img
              src={post.image}
              alt="Post image"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2",
                isLiked && "text-red-500"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              <span>{post.likes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onComment?.(post.id)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onShare?.(post.id)}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">{post.timestamp}</p>
        </div>
      </div>
    </Card>
  )
}
