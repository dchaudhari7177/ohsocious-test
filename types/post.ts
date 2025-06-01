export type ReactionType = "" | "😂" | "❤️" | "🫶" | "👍" | "🎉" | "🤔" | "😮"

export type PostUser = {
  name: string
  avatar: string
  department: string
}

export type PollOption = {
  text: string
  votes: number
}

export type Comment = {
  id: string
  user: PostUser
  content: string
  timestamp: string
}

export type Post = {
  id: string
  type: "normal" | "confession" | "poll"
  user?: PostUser
  userId?: string
  anonymousAvatar?: string
  anonymousName?: string
  content: string
  image?: string
  timestamp: string
  createdAt?: string
  reactions: Record<ReactionType, number>
  comments: Comment[]
  options?: PollOption[]
  isBookmarked?: boolean
  isOwn?: boolean
  reported?: boolean
} 