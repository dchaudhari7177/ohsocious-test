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
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"
import { PostCard, Post } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

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
  const [userCache, setUserCache] = useState<Record<string, any>>({})
  // Confession dialog state
  const [confession, setConfession] = useState("")
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const moods = ["😊", "😂", "😅", "😭", "😍", "🤔", "😱", "🙄", "😴", "🥺"]
  const popularHashtags = [
    "CampusLife",
    "StudyProblems",
    "DormStories",
    "ProfessorFails",
    "ClassCrush",
    "MidtermMadness",
    "CafeteriaFood",
  ]

  // Add random Gen Z anonymous names and emojis
  const anonymousNames = [
    { name: "Mystery Maven", emoji: "👻" },
    { name: "Secret Unicorn", emoji: "🦄" },
    { name: "Sneaky Fox", emoji: "🦊" },
    { name: "Vibe Ninja", emoji: "🕶️" },
    { name: "Chill Panda", emoji: "🐼" },
    { name: "Cosmic Cat", emoji: "🐱‍🚀" },
    { name: "Dreamy Owl", emoji: "🦉" },
    { name: "Hype Dolphin", emoji: "🐬" },
    { name: "Zen Sloth", emoji: "🦥" },
    { name: "Groovy Llama", emoji: "🦙" },
    { name: "Moody Koala", emoji: "🐨" },
    { name: "Sassy Penguin", emoji: "🐧" },
    { name: "Quirky Quokka", emoji: "🦘" },
    { name: "Blissful Bunny", emoji: "🐰" },
    { name: "Witty Whale", emoji: "🐋" },
    { name: "Chill Corgi", emoji: "🐶" },
    { name: "Peachy Parrot", emoji: "🦜" },
    { name: "Sunny Seal", emoji: "��" },
    { name: "Lucky Lynx", emoji: "🐱" },
    { name: "Funky Ferret", emoji: "🦡" },
  ]
  function getRandomAnonymous() {
    return anonymousNames[Math.floor(Math.random() * anonymousNames.length)]
  }

  // Helper to fetch user info by userId and cache it
  const fetchUserInfo = async (userId: string) => {
    if (userCache[userId]) return userCache[userId]
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      const data = userDoc.data()
      const userInfo = {
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown User",
        avatar: data.profileImage || "",
        department: data.department || "",
      }
      setUserCache((prev) => ({ ...prev, [userId]: userInfo }))
      return userInfo
    }
    return { name: "Unknown User", avatar: "", department: "" }
  }

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

    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      console.log("onSnapshot received snapshot:", snapshot.size, "docs")
      const postsWithUser = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        let userInfo = data.user
        if (!userInfo && data.userId) {
          userInfo = await fetchUserInfo(data.userId)
        }
        let likedByCurrentUser = false
        let likeCount = 0
        if (user) {
          const likeDocRef = doc(db, "posts", docSnap.id, "likes", user.uid)
          const likeDoc = await getDoc(likeDocRef)
          likedByCurrentUser = likeDoc.exists()
        }
        // Always count likes from the subcollection
        const likesSnapshot = await getDocs(collection(db, "posts", docSnap.id, "likes"))
        likeCount = likesSnapshot.size
        return {
          id: docSnap.id,
          userId: data.userId,
          content: data.content,
          createdAt: data.createdAt,
          image: data.image,
          likes: likeCount,
          comments: data.comments || 0,
          type: data.type || "normal",
          user: userInfo,
          reactions: data.reactions || {},
          timestamp: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : "Just now",
          anonymousName: data.anonymousName,
          anonymousAvatar: data.anonymousAvatar,
          mood: data.mood,
          hashtags: data.hashtags,
          likedByCurrentUser,
        }
      }))
      setPosts(postsWithUser)
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
      const newPostsWithUser = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data()
        let userInfo = data.user
        if (!userInfo && data.userId) {
          userInfo = await fetchUserInfo(data.userId)
        }
        return {
          id: doc.id,
          userId: data.userId,
          content: data.content,
          createdAt: data.createdAt,
          image: data.image,
          likes: data.likes || 0,
          comments: data.comments || 0,
          type: data.type || "normal",
          user: userInfo,
          reactions: data.reactions || {},
          timestamp: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : "Just now"
        }
      }))

      setPosts((prev) => [...prev, ...newPostsWithUser])
      setLastPost(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === 10)
    } catch (error) {
      console.error("Error loading more posts:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    const postRef = doc(db, "posts", postId)
    const likeRef = doc(db, "posts", postId, "likes", user.uid)
    const postIndex = posts.findIndex((p) => p.id === postId)
    if (postIndex === -1) return
    const isLiked = posts[postIndex].likedByCurrentUser
    // Optimistically update UI
    const updatedPosts = [...posts]
    updatedPosts[postIndex] = {
      ...updatedPosts[postIndex],
      likes: isLiked ? updatedPosts[postIndex].likes - 1 : updatedPosts[postIndex].likes + 1,
      likedByCurrentUser: !isLiked,
    }
    setPosts(updatedPosts)
    try {
      if (isLiked) {
        // Remove like
        await deleteDoc(likeRef)
        await updateDoc(postRef, { likes: updatedPosts[postIndex].likes })
      } else {
        // Add like
        await setDoc(likeRef, { userId: user.uid, createdAt: serverTimestamp() })
        await updateDoc(postRef, { likes: updatedPosts[postIndex].likes })
      }
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleComment = async (postId: string) => {
    // TODO: Implement comment functionality
    console.log("Comment on post:", postId)
  }

  const handleShare = async (postId: string) => {
    // TODO: Implement share functionality
    console.log("Share post:", postId)
  }

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood === selectedMood ? null : mood)
  }

  const toggleHashtag = (hashtag: string) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(selectedHashtags.filter((h) => h !== hashtag))
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag])
    }
  }

  const handleConfessionSubmit = async () => {
    if (!user || !confession.trim()) return
    // Add confession post to Firestore
    try {
      const anon = getRandomAnonymous()
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        content: confession.trim(),
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        type: "confession",
        reactions: {},
        mood: selectedMood,
        hashtags: selectedHashtags,
        user: null, // anonymous
        anonymousName: anon.name,
        anonymousAvatar: anon.emoji,
      })
      setConfession("")
      setSelectedMood(null)
      setSelectedHashtags([])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating confession:", error)
    }
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
            {activeTab === "all" && user && (
              <div className="sticky top-16 z-10 mb-6 bg-white/80 backdrop-blur-sm">
                <CreatePost postType="normal" />
              </div>
            )}
            {activeTab === "confessions" && (
              <>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="sticky top-16 z-10 mx-auto flex w-full max-w-xs items-center justify-center gap-2 bg-primary-purple shadow-lg hover:bg-primary-purple/90 sm:w-auto">
                      <span className="font-bold text-lg">+</span> Confess Something...
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share your confession anonymously</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="Tell us your tea... 🫖"
                        className="min-h-32 resize-none"
                        value={confession}
                        onChange={(e) => setConfession(e.target.value)}
                      />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select a mood</p>
                        <div className="flex flex-wrap gap-2">
                          {moods.map((mood) => (
                            <button
                              key={mood}
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${selectedMood === mood ? "bg-primary-purple/20 ring-2 ring-primary-purple" : "bg-gray-100"}`}
                              onClick={() => handleMoodSelect(mood)}
                            >
                              {mood}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Add hashtags</p>
                        <div className="flex flex-wrap gap-2">
                          {popularHashtags.map((hashtag) => (
                            <Badge
                              key={hashtag}
                              variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                              className={`cursor-pointer ${selectedHashtags.includes(hashtag) ? "bg-primary-purple hover:bg-primary-purple/90" : "hover:bg-gray-100"}`}
                              onClick={() => toggleHashtag(hashtag)}
                            >
                              #{hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md bg-amber-50 p-3">
                        <p className="text-xs text-amber-800">
                          Your confession will be posted anonymously. However, abusive or harmful content will be removed and may result in account suspension.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-primary-purple hover:bg-primary-purple/90"
                          onClick={handleConfessionSubmit}
                          disabled={!confession.trim()}
                        >
                          Post Anonymously
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            
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
