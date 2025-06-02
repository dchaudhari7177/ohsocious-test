"use client"

import { useState } from "react"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { Loader2, Users, Sparkles, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { PostCard, Post } from "@/components/post-card"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

export default function ProfilePage() {
  const { user, userData } = useAuth()
  const [activeTab, setActiveTab] = useState<"posts" | "confessions">("posts")

  const fetchPosts = async ({ pageParam = null }) => {
    if (!user) return { items: [], nextCursor: null }

    let postsQuery = query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      where("type", "==", activeTab === "posts" ? "normal" : "confession"),
      orderBy("createdAt", "desc"),
      limit(10)
    )

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
          user: {
            name: `${userData?.firstName} ${userData?.lastName}`,
            avatar: userData?.profileImage || "",
            department: userData?.department || "",
          },
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
    if (value === "posts" || value === "confessions") {
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

  if (!user || !userData) return null

  return (
    <Container>
      <div className="flex flex-col gap-6 py-6 md:flex-row md:gap-8 md:py-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <Card className="overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-32 bg-gradient-to-r from-primary-purple to-secondary-pink md:h-48">
              {userData.coverImage && (
                <img
                  src={userData.coverImage}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="relative px-4 pb-4 pt-16 md:px-6 md:pb-6">
              {/* Avatar */}
              <div className="absolute -top-16 left-4 md:left-6">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={userData.profileImage} />
                  <AvatarFallback>
                    {userData.firstName?.[0]}
                    {userData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Details */}
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {userData.department && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>{userData.department}</span>
                      </div>
                    )}
                    {userData.year && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{userData.year} Year</span>
                      </div>
                    )}
                    {userData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{userData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button>Edit Profile</Button>
                  <Button variant="outline">Share Profile</Button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userData.posts || 0}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {userData.followers?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {userData.following?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="confessions" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Confessions
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
                {activeTab === "posts"
                  ? "Share your thoughts with your peers"
                  : "Share your secrets anonymously"}
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
        <div className="w-full space-y-6 md:w-80 lg:w-96">
          {/* About */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">About</h3>
            <div className="space-y-4">
              {userData.bio ? (
                <p className="text-sm text-gray-600">{userData.bio}</p>
              ) : (
                <p className="text-sm text-gray-500">No bio yet</p>
              )}
              {userData.interests && userData.interests.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest) => (
                      <div
                        key={interest}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Photos */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {userData.photos?.slice(0, 9).map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-md"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            {(userData.photos?.length || 0) > 9 && (
              <Button variant="link" className="mt-4 w-full">
                View All Photos
              </Button>
            )}
          </Card>
        </div>
      </div>
    </Container>
  )
}
