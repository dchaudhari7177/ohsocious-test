"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Settings, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { PostCard } from "@/components/post-card"
import type { Post } from "@/types/post"
import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { EditProfileModal } from "@/components/edit-profile-modal"

interface UserData {
  firstName: string
  lastName: string
  department: string
  year: string
  bio: string
  vibe?: { emoji: string; name: string }
  interests?: string[]
  profileImage?: string
  coverImage?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posts")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ posts: 0, connections: 0 })
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isEditingCover, setIsEditingCover] = useState(false)

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        router.push("/onboarding/login")
        return
      }

      // Fetch user profile
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      }

      // Fetch user posts
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      )
      const postsSnapshot = await getDocs(postsQuery)
      const userData = userDoc.data()
      if (!userData) return
      
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isOwn: true,
        user: {
          name: `${userData.firstName} ${userData.lastName}`,
          department: userData.department,
          avatar: userData.profileImage || "/placeholder.svg?height=40&width=40"
        }
      })) as Post[]
      setUserPosts(posts)
      
      // Update stats
      setStats({
        posts: postsSnapshot.size,
        connections: userData.connectionsCount || 0
      })

    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [router])

  const handleEditProfile = () => {
    setIsEditProfileOpen(true)
  }

  const handleProfileUpdate = () => {
    // Refetch user data
    fetchUserData()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Back Button */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feed">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-lg font-semibold text-gray-700">Profile</span>
      </div>
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-32 w-full bg-gradient-to-r from-primary-purple to-secondary-pink sm:h-48">
          {userData.coverImage && (
            <Image
              src={userData.coverImage}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
          <div className="absolute bottom-0 right-0 m-4">
            <Button variant="secondary" size="sm" className="bg-white text-gray-700 hover:bg-gray-100">
              <Edit className="mr-1 h-4 w-4" /> Edit Cover
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Profile Info */}
          <div className="relative px-6 pb-5 pt-0">
            <div className="absolute -top-12 left-6 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
              <Image
                src={userData.profileImage || "/placeholder.svg?height=96&width=96"}
                alt="Profile"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="ml-28 mt-3 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{`${userData.firstName} ${userData.lastName}`}</h1>
                <p className="text-sm text-gray-600">
                  {userData.department} • {userData.year}
                </p>
                {userData.vibe && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-purple/10 text-sm">
                      {userData.vibe.emoji}
                    </span>
                    <span className="text-xs text-gray-600">{userData.vibe.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">
                    <Settings className="mr-1 h-4 w-4" /> Settings
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary-purple hover:bg-primary-purple/90"
                  onClick={handleEditProfile}
                >
                  <Edit className="mr-1 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <p className="text-sm text-gray-700">{userData.bio}</p>
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-4">
              <div className="text-center">
                <p className="font-bold text-primary-purple">{stats.posts}</p>
                <p className="text-xs text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-primary-purple">{stats.connections}</p>
                <p className="text-xs text-gray-600">Connections</p>
              </div>
            </div>

            {/* Interests */}
            {userData.interests && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-gray-600">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map((interest) => (
                    <span key={interest} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posts Tab */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="p-4">
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {userPosts.length === 0 && (
                  <p className="text-center text-sm text-gray-500">No posts yet</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="media" className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {userPosts
                  .filter((post) => post.image)
                  .map((post) => (
                    <div key={post.id} className="aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={post.image || ""}
                        alt="Post media"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                {userPosts.filter((post) => post.image).length === 0 && (
                  <p className="col-span-3 text-center text-sm text-gray-500">No media posts yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {userData && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          userData={userData}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}
