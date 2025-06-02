"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Container } from "@/components/ui/container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MessageSquare, ThumbsUp, Share2, Users, Sparkles } from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  userId: string
  content: string
  createdAt: Date
  image?: string
  likes: number
  comments: number
  type: "normal" | "confession"
  user: {
    name: string
    avatar?: string
    department?: string
  }
  anonymousName?: string
  anonymousAvatar?: string
}

export default function FeedPage() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState<"all" | "confessions">("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastPost, setLastPost] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPosts = async (isLoadingMore = false) => {
    if (!user) return

    try {
      setError(null)
      if (!isLoadingMore) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      let postsQuery = query(
        collection(db, "posts"),
        where("type", "==", activeTab === "all" ? "normal" : "confession"),
        orderBy("createdAt", "desc"),
        limit(10)
      )

      if (isLoadingMore && lastPost) {
        postsQuery = query(
          collection(db, "posts"),
          where("type", "==", activeTab === "all" ? "normal" : "confession"),
          orderBy("createdAt", "desc"),
          startAfter(lastPost),
          limit(10)
        )
      }

      const snapshot = await getDocs(postsQuery)
      const newPosts = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            content: data.content,
            createdAt: data.createdAt?.toDate() || new Date(),
            image: data.image,
            likes: data.likes || 0,
            comments: data.comments || 0,
            type: data.type || "normal",
            user: {
              name: data.type === "confession" ? "Anonymous" : `${userData?.firstName} ${userData?.lastName}`,
              avatar: data.type === "confession" ? undefined : userData?.profileImage,
              department: data.type === "confession" ? undefined : userData?.department,
            },
            anonymousName: data.type === "confession" ? "Anonymous" : undefined,
            anonymousAvatar: data.type === "confession" ? "👻" : undefined,
          }
        })
      )

      if (!isLoadingMore) {
        setPosts(newPosts)
      } else {
        setPosts((prev) => [...prev, ...newPosts])
      }

      setLastPost(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === 10)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Failed to load posts. Please try again.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [activeTab, user, userData])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(true)
    }
  }

  const handleLike = async (postId: string) => {
    // Implement like functionality
    console.log("Like post:", postId)
  }

  const handleComment = async (postId: string) => {
    // Implement comment functionality
    console.log("Comment on post:", postId)
  }

  const handleShare = async (postId: string) => {
    // Implement share functionality
    console.log("Share post:", postId)
  }

  if (loading) {
    return (
      <Container>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold text-red-500">Error</h3>
          <p className="text-gray-500">{error}</p>
          <Button onClick={() => fetchPosts()} className="mt-4">
            Try Again
          </Button>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "confessions")}>
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              All Posts
            </TabsTrigger>
            <TabsTrigger value="confessions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Confessions
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <h3 className="text-lg font-semibold">No posts yet</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === "all"
                    ? "Be the first to share something with your peers!"
                    : "No confessions yet. Share your thoughts anonymously!"}
                </p>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="p-4">
                      {/* Post Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          {post.type === "confession" ? (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl">
                              {post.anonymousAvatar}
                            </div>
                          ) : post.user.avatar ? (
                            <AvatarImage src={post.user.avatar} alt={post.user.name} />
                          ) : (
                            <AvatarFallback className="bg-primary-purple text-white">
                              {post.user.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{post.user.name}</p>
                            {post.user.department && (
                              <span className="text-sm text-gray-500">• {post.user.department}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="mt-3 whitespace-pre-wrap">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post image"
                          className="mt-3 rounded-lg"
                        />
                      )}

                      {/* Post Actions */}
                      <div className="mt-4 flex items-center gap-4 border-t pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleLike(post.id)}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          {post.likes > 0 && post.likes}
                          <span className="ml-1">Like</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleComment(post.id)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {post.comments > 0 && post.comments}
                          <span className="ml-1">Comment</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleShare(post.id)}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Tabs>
      </div>
    </Container>
  )
}
