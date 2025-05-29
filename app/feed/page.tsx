"use client"
import { useState } from "react"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Sample post data
const initialPosts: Post[] = [
  {
    id: "1",
    type: "normal",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
    },
    content: "Just aced my algorithms exam! Anyone want to celebrate at the campus coffee shop later? #CSLife",
    image: "/placeholder.svg?height=300&width=500",
    timestamp: "2 hours ago",
    reactions: {
      "🔥": 24,
      "😂": 5,
      "❤️": 18,
      "🫶": 7,
      "👍": 0,
      "🎉": 0,
      "🤔": 0,
      "😮": 0,
    },
    comments: [
      {
        id: "c1",
        user: {
          name: "Jane Doe",
          avatar: "/placeholder.svg?height=40&width=40",
          department: "Math",
        },
        content: "Great post!",
        timestamp: "1 hour ago",
      }
    ],
    isBookmarked: false,
    isOwn: false,
    reported: false,
  },
  {
    id: "2",
    type: "confession",
    anonymousAvatar: "👻",
    anonymousName: "Mystery Maven",
    content:
      "I've been pretending to understand quantum physics all semester but I'm completely lost. Anyone else feeling the same? 😅",
    timestamp: "3 hours ago",
    reactions: {
      "🔥": 45,
      "😂": 67,
      "❤️": 12,
      "🫶": 8,
      "👍": 0,
      "🎉": 0,
      "🤔": 0,
      "😮": 0,
    },
    comments: [],
    isBookmarked: false,
    isOwn: false,
    reported: false,
  },
  {
    id: "3",
    type: "poll",
    user: {
      name: "Taylor Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Business",
    },
    content: "Best study spot on campus?",
    options: [
      { text: "Library 3rd floor", votes: 45 },
      { text: "Student Union", votes: 28 },
      { text: "Coffee shop", votes: 67 },
      { text: "Outdoors by the lake", votes: 34 },
    ],
    timestamp: "5 hours ago",
    reactions: {
      "🔥": 12,
      "😂": 3,
      "❤️": 8,
      "🫶": 2,
      "👍": 0,
      "🎉": 0,
      "🤔": 0,
      "😮": 0,
    },
    comments: [],
    isBookmarked: false,
    isOwn: false,
    reported: false,
  },
  {
    id: "4",
    type: "normal",
    user: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Art & Design",
    },
    content:
      "Just finished my final project for digital media class! So proud of how it turned out. Check it out and let me know what you think!",
    image: "/placeholder.svg?height=300&width=500",
    timestamp: "6 hours ago",
    reactions: {
      "🔥": 56,
      "😂": 2,
      "❤️": 89,
      "🫶": 23,
      "👍": 0,
      "🎉": 0,
      "🤔": 0,
      "😮": 0,
    },
    comments: [],
    isBookmarked: false,
    isOwn: false,
    reported: false,
  },
]

type ReactionType = "🔥" | "😂" | "❤️" | "🫶" | "👍" | "🎉" | "🤔" | "😮"

type Comment = {
  id: string
  user: {
    name: string
    avatar: string
    department: string
  }
  content: string
  timestamp: string
  replies?: Comment[]
}

type Post = {
  id: string
  type: "normal" | "confession" | "poll"
  user?: {
    name: string
    avatar: string
    department: string
  }
  anonymousAvatar?: string
  anonymousName?: string
  content: string
  image?: string
  timestamp: string
  reactions: Record<ReactionType, number>
  comments: Comment[]
  options?: Array<{
    text: string
    votes: number
  }>
  isBookmarked?: boolean
  isOwn?: boolean
  reported?: boolean
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [showModal, setShowModal] = useState(false)
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({})

  // Animation: fade-in for posts
  // (CSS only, using transition-opacity and a key)

  // Modal handlers
  const openModal = () => setShowModal(true)
  const closeModal = () => {
    setShowModal(false)
    setNewPost("")
  }
  const handleCreatePost = () => {
    if (!newPost.trim()) return
    setIsPosting(true)
    setTimeout(() => {
      setPosts([
        {
          id: Date.now().toString(),
          type: "normal" as const,
          user: {
            name: "You",
            avatar: "/placeholder.svg?height=40&width=40",
            department: "Your Department",
          },
          content: newPost,
          image: "",
          timestamp: "Just now",
          reactions: {
            "🔥": 0,
            "😂": 0,
            "❤️": 0,
            "🫶": 0,
            "👍": 0,
            "🎉": 0,
            "🤔": 0,
            "😮": 0
          },
          comments: [],
          isBookmarked: false,
          isOwn: true,
          reported: false,
        },
        ...posts,
      ])
      setIsPosting(false)
      closeModal()
    }, 700)
  }

  const handleReaction = (postId: string, emoji: ReactionType) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentReaction = userReactions[postId]
        const reactions = { ...post.reactions }
        
        // Remove previous reaction if exists
        if (currentReaction) {
          reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 0) - 1)
        }
        
        // Add new reaction if different from current
        if (currentReaction !== emoji) {
          reactions[emoji] = (reactions[emoji] || 0) + 1
          setUserReactions(prev => ({ ...prev, [postId]: emoji }))
        } else {
          // Remove reaction if clicking the same emoji
          setUserReactions(prev => {
            const newReactions = { ...prev }
            delete newReactions[postId]
            return newReactions
          })
        }
        
        return { ...post, reactions }
      }
      return post
    }))
  }

  const handleReport = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, reported: true }
      }
      return post
    }))
  }

  const handleDelete = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  const handleComment = (postId: string, comment: string) => {
    setPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now().toString(),
              user: {
                name: "You",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "Your Department",
              },
              content: comment,
              timestamp: "Just now",
            },
          ],
        }
      }
      return post
    }))
  }

  const handleReply = (postId: string, commentId: string, reply: string) => {
    setPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [
                  ...(comment.replies || []),
                  {
                    id: Date.now().toString(),
                    user: {
                      name: "You",
                      avatar: "/placeholder.svg?height=40&width=40",
                      department: "Your Department",
                    },
                    content: reply,
                    timestamp: "Just now",
                  },
                ],
              }
            }
            return comment
          })
        }
      }
      return post
    }))
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-white via-blue-50 to-purple-50 pb-20">
      {/* Floating Create Post Button */}
      <Button
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-purple shadow-lg hover:bg-primary-purple/90 sm:static sm:top-16 sm:mx-auto sm:mb-4 sm:w-auto sm:max-w-xs sm:rounded-md sm:gap-2"
        aria-label="Create Post"
        onClick={openModal}
      >
        <Plus className="h-6 w-6 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Create Post</span>
      </Button>

      {/* Modal for Creating Post */}
      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent>
          <DialogTitle>Create a Post</DialogTitle>
          <textarea
            className="w-full resize-none rounded border border-gray-200 p-2 focus:border-primary-purple focus:outline-none"
            rows={4}
            placeholder="What's on your mind?"
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            disabled={isPosting}
            aria-label="Post content"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal} disabled={isPosting}>
              Cancel
            </Button>
            <Button
              className="bg-primary-purple hover:bg-primary-purple/90"
              onClick={handleCreatePost}
              disabled={!newPost.trim() || isPosting}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mx-auto max-w-2xl space-y-4 pt-8">
        {/* Empty State */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <Plus className="mb-2 h-10 w-10" />
            <p className="text-lg font-semibold">No posts yet</p>
            <p className="mb-4 text-sm">Be the first to share something with your campus!</p>
            <Button className="bg-primary-purple hover:bg-primary-purple/90" onClick={openModal}>
              <Plus className="mr-2 h-4 w-4" /> Create Post
            </Button>
          </div>
        ) : (
      <div className="space-y-4">
            {posts.map((post, idx) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <PostCard 
                  post={post} 
                  onReact={handleReaction}
                  onReport={handleReport}
                  onDelete={handleDelete}
                  onComment={handleComment}
                  onReply={handleReply}
                />
              </div>
        ))}
          </div>
        )}
      </div>
      {/* Fade-in animation keyframes */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s both;
        }
      `}</style>
    </div>
  )
}
