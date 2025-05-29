"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Settings, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { PostCard, type Post } from "@/components/post-card"
import Link from "next/link"

// Mock user data
const userData = {
  name: "Alex Johnson",
  department: "Computer Science",
  year: "Junior",
  vibe: { emoji: "🔥", name: "Party Animal" },
  interests: ["Music", "Gaming", "Startups", "Events", "Photography", "Hiking"],
  posts: 42,
  connections: 128,
  bio: "CS major with a passion for web development and AI. Always looking for new projects and hackathons!",
}

// Mock posts data
const userPosts: Post[] = [
  {
    id: "1",
    type: "normal",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
    },
    content: "Just submitted my final project for Web Development! Check out this UI I built 🚀",
    image: "/placeholder.svg?height=300&width=500",
    timestamp: "2 days ago",
    reactions: {
      "": 0,
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
        content: "Awesome work!",
        timestamp: "1 day ago",
      },
    ],
    isBookmarked: false,
    isOwn: true,
    reported: false,
  },
  {
    id: "2",
    type: "poll",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
    },
    content: "Which programming language should I learn next?",
    options: [
      { text: "Python", votes: 45 },
      { text: "JavaScript", votes: 28 },
      { text: "Rust", votes: 67 },
      { text: "Go", votes: 34 },
    ],
    timestamp: "1 week ago",
    reactions: {
      "": 0,
      "🔥": 12,
      "😂": 3,
      "❤️": 8,
      "🫶": 2,
      "👍": 0,
      "🎉": 0,
      "🤔": 0,
      "😮": 0,
    },
    comments: [
      {
        id: "c2",
        user: {
          name: "Sam Lee",
          avatar: "/placeholder.svg?height=40&width=40",
          department: "Physics",
        },
        content: "Try Rust! It's awesome.",
        timestamp: "6 days ago",
      },
    ],
    isBookmarked: true,
    isOwn: true,
    reported: false,
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")

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
                src="/placeholder.svg?height=96&width=96"
                alt="Profile"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="ml-28 mt-3 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-sm text-gray-600">
                  {userData.department} • {userData.year}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-purple/10 text-sm">
                    {userData.vibe.emoji}
                  </span>
                  <span className="text-xs text-gray-600">{userData.vibe.name}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">
                    <Settings className="mr-1 h-4 w-4" /> Settings
                  </Link>
                </Button>
                <Button size="sm" className="bg-primary-purple hover:bg-primary-purple/90">
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
                <p className="font-bold text-primary-purple">{userData.posts}</p>
                <p className="text-xs text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-primary-purple">{userData.connections}</p>
                <p className="text-xs text-gray-600">Connections</p>
              </div>
            </div>

            {/* Interests */}
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
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
            <div className="border-t">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="posts"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-purple"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-purple"
                >
                  Media
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-purple"
                >
                  Saved
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="posts" className="mt-0 space-y-4 p-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>

            <TabsContent value="media" className="mt-0 p-4">
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square overflow-hidden">
                    <Image
                      src={`/placeholder.svg?height=150&width=150&text=Image${i}`}
                      alt={`Media ${i}`}
                      width={150}
                      height={150}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-0 p-4">
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-gray-500">No saved posts yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
