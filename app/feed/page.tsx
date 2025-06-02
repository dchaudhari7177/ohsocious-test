"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Container } from "@/components/ui/container"
import { Card } from "@/components/ui/card"
import { Button, ButtonProps } from "@/components/ui/button"
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
  onSnapshot,
} from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"
import { PostCard, Post } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"

export default function FeedPage() {
  const { user, userData } = useAuth()
  console.log("FeedPage rendering. User:", user, "UserData:", userData)
  const [activeTab, setActiveTab] = useState<"all" | "confessions">("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastPost, setLastPost] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    console.log("FeedPage useEffect triggered:", { user: user?.email, activeTab })
    if (!user) {
      console.log("User not available, skipping fetch.")
      setLoading(false)
      return
    }

    console.log("User available, fetching posts...")
    const postsQuery = query(
      collection(db, "posts"),
      where("type", "==", activeTab === "all" ? "normal" : "confession"),
      orderBy("createdAt", "desc"),
      limit(10)
    )
    console.log("Posts query built:", postsQuery)

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      console.log("onSnapshot received snapshot:", snapshot.size, "docs")
      const newPosts = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          content: data.content,
          createdAt: data.createdAt,
          image: data.image,
          likes: data.likes || 0,
          comments: data.comments || 0,
          type: data.type || "normal",
          user: data.user,
          reactions: data.reactions || {},
          timestamp: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : "Just now"
        }
      })
      setPosts(newPosts)
      setLastPost(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === 10)
      setLoading(false)
      console.log("Posts state updated.")
    }, (error) => {
      console.error("Error fetching posts in onSnapshot:", error)
      setError("Failed to load posts. Please try again.")
      setLoading(false)
    })

    return () => {
      console.log("Unsubscribing from onSnapshot")
      unsubscribe()
    }
  }, [activeTab, user])

  const handleLoadMore = async () => {
    if (!user || !lastPost || loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("type", "==", activeTab === "all" ? "normal" : "confession"),
        orderBy("createdAt", "desc"),
        startAfter(lastPost),
        limit(10)
      )

      const snapshot = await getDocs(postsQuery)
      const newPosts = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          content: data.content,
          createdAt: data.createdAt,
          image: data.image,
          likes: data.likes || 0,
          comments: data.comments || 0,
          type: data.type || "normal",
          user: data.user,
          reactions: data.reactions || {},
          timestamp: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : "Just now"
        }
      })

      setPosts((prev) => [...prev, ...newPosts])
      setLastPost(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === 10)
    } catch (error) {
      console.error("Error loading more posts:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleLike = async (postId: string) => {
    // TODO: Implement like functionality
    console.log("Like post:", postId)
  }

  const handleComment = async (postId: string) => {
    // TODO: Implement comment functionality
    console.log("Comment on post:", postId)
  }

  const handleShare = async (postId: string) => {
    // TODO: Implement share functionality
    console.log("Share post:", postId)
  }

  if (loading) {
    return (
      <Container>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
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
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-6">
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "all" | "confessions")}>
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
            {user && <CreatePost postType={activeTab === "all" ? "normal" : "confession"} />}
            
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
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                  />
                ))}

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="outline"
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
