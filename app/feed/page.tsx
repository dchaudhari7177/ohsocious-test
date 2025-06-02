"use client"

import { useState } from "react"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { CardGrid } from "@/components/card-grid"
import { PostCard, Post } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"
import { Loader2, Users, Sparkles } from "lucide-react"
import { UserCard } from "@/components/user-card"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

interface UserData {
  following?: string[]
}

export default function FeedPage() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState<"all" | "following">("all")
  const [loading, setLoading] = useState(false)

  const fetchPosts = async ({ pageParam = null }: { pageParam?: Timestamp | null }) => {
    if (!user) return { items: [], nextCursor: null }

    let postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    )

    if (activeTab === "following" && (userData as UserData)?.following?.length) {
      postsQuery = query(
        collection(db, "posts"),
        where("userId", "in", (userData as UserData).following),
        orderBy("createdAt", "desc"),
        limit(10)
      )
    }

    if (pageParam) {
      postsQuery = query(
        postsQuery,
        where("createdAt", "<", pageParam)
      )
    }

    const snapshot = await getDocs(postsQuery)
    const items = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const userDoc = await getDocs(query(collection(db, "users"), where("userId", "==", data.userId)))
        const userData = userDoc.docs[0]?.data()

        return {
          id: doc.id,
          userId: data.userId,
          content: data.content,
          createdAt: data.createdAt,
          image: data.image,
          likes: data.likes || 0,
          comments: data.comments || 0,
          type: data.type || "normal",
          reactions: data.reactions || {},
          timestamp: data.createdAt?.toDate()?.toLocaleString() || "",
          user: userData ? {
            name: `${userData.firstName} ${userData.lastName}`,
            avatar: userData.profileImage || "",
            department: userData.department || "",
          } : undefined,
          anonymousName: data.type === "confession" ? "Anonymous" : undefined,
          anonymousAvatar: data.type === "confession" ? "👻" : undefined,
        } as Post
      })
    )

    const lastItem = items[items.length - 1]
    const nextCursor = lastItem?.createdAt || null

    return { items, nextCursor }
  }

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteScroll<Post>(fetchPosts)

  const handleTabChange = (value: string) => {
    if (value === "all" || value === "following") {
      setActiveTab(value)
    }
  }

  const handleLike = async (postId: string) => {
    // Implement like functionality
  }

  const handleComment = async (postId: string) => {
    // Implement comment functionality
  }

  const handleShare = async (postId: string) => {
    // Implement share functionality
  }

  return (
    <Container>
      <div className="flex flex-col gap-6 py-6 md:flex-row md:gap-8 md:py-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <PageHeader
            title="Campus Feed"
            description="See what's happening on campus"
          />

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                All Posts
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Following
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
            </div>
          ) : data.pages[0].items.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-sm text-gray-500">
                {activeTab === "following"
                  ? "Follow more people to see their posts here"
                  : "Be the first to post something!"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.pages.map((page, pageIndex) => (
                <div key={pageIndex} className="space-y-4">
                  {page.items.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              ))}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Suggested People</h3>
              <div className="space-y-4">
                <UserCard
                  name="John Doe"
                  department="Computer Science"
                  year="Senior"
                  imageSrc="/placeholder.jpg"
                />
                <UserCard
                  name="Jane Smith"
                  department="Business"
                  year="Junior"
                  imageSrc="/placeholder.jpg"
                />
                <UserCard
                  name="Mike Johnson"
                  department="Engineering"
                  year="Sophomore"
                  imageSrc="/placeholder.jpg"
                />
              </div>
              <Button variant="link" className="mt-4 w-full">
                See More
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Trending Topics</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  #CampusLife
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  #StudyGroup
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  #Finals
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
}
