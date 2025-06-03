export interface UserData {
  firstName: string
  lastName: string
  email: string
  department: string
  year: string
  bio: string
  location?: string
  profileImage?: string
  interests?: string[]
  following?: string[]
  notifications?: {
    email: boolean
    push: boolean
    mentions: boolean
    messages: boolean
  }
  privacy?: {
    profileVisibility: "public" | "private"
    showEmail: boolean
    allowMessages: boolean
  }
  vibe?: {
    emoji: string
    name: string
  }
  updatedAt?: Date
  createdAt?: Date
} 