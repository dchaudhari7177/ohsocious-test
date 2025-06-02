"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserPlus, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserCardProps {
  name: string
  department: string
  year: string
  imageSrc?: string
  bio?: string
  vibe?: { emoji: string; name: string }
  interests?: string[]
  onFollow?: () => void
  onChat?: () => void
  onViewProfile?: () => void
  isFollowing?: boolean
}

export function UserCard({
  name,
  department,
  year,
  imageSrc,
  bio,
  vibe,
  interests,
  onFollow,
  onChat,
  onViewProfile,
  isFollowing = false,
}: UserCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <Card className="flex flex-col p-4 gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {imageSrc ? (
            <AvatarImage src={imageSrc} alt={name} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-500">
            {department} • {year}
          </p>
        </div>
      </div>

      {(bio || vibe || interests) && (
        <div className="space-y-2">
          {bio && (
            <p className="text-sm text-gray-600 line-clamp-2">{bio}</p>
          )}
          {vibe && (
            <p className="text-sm">
              <span className="mr-1">{vibe.emoji}</span>
              {vibe.name}
            </p>
          )}
          {interests && interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {interest}
                </span>
              ))}
              {interests.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{interests.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {onViewProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            className="flex items-center gap-1"
          >
            <User className="h-4 w-4" />
            View Profile
          </Button>
        )}
        {onChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onChat}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        )}
        {onFollow && (
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={onFollow}
            className={cn(
              "flex items-center gap-1 ml-auto",
              isFollowing && "hover:bg-destructive hover:text-white"
            )}
          >
            <UserPlus className="h-4 w-4" />
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
    </Card>
  )
} 