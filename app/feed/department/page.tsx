import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Image from "next/image"

// Sample department data
const departmentInfo = {
  name: "Computer Science",
  description: "Department of Computer Science and Engineering",
  memberCount: 342,
  image: "/placeholder.svg?height=80&width=80",
}

// Sample department posts
const departmentPosts = [
  {
    id: "1",
    type: "normal",
    user: {
      name: "Prof. Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
    },
    content:
      "Reminder: The deadline for the final project submission is this Friday at 11:59 PM. Make sure to upload your code to the course repository and submit the report via Canvas.",
    timestamp: "1 hour ago",
    reactions: {
      "🔥": 5,
      "😂": 2,
      "❤️": 24,
      "🫶": 8,
    },
    comments: 7,
  },
  {
    id: "2",
    type: "normal",
    user: {
      name: "CS Department",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
    },
    content:
      "🎉 Congratulations to our students who won the Regional Hackathon! Your innovative solutions impressed the judges and brought honor to our department.",
    image: "/placeholder.svg?height=300&width=500",
    timestamp: "3 hours ago",
    reactions: {
      "🔥": 45,
      "😂": 3,
      "❤️": 67,
      "🫶": 12,
    },
    comments: 15,
  },
  {
    id: "3",
    type: "poll",
    user: {
      name: "CS Student Council",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Computer Science",
    },
    content: "What topic would you like for our next workshop?",
    options: [
      { text: "Machine Learning", votes: 45 },
      { text: "Web Development", votes: 28 },
      { text: "Cybersecurity", votes: 67 },
      { text: "Game Development", votes: 34 },
    ],
    timestamp: "1 day ago",
    reactions: {
      "🔥": 12,
      "😂": 3,
      "❤️": 8,
      "🫶": 2,
    },
    comments: 7,
  },
]

export default function DepartmentFeedPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Department Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary-purple/10">
              <Image
                src={departmentInfo.image || "/placeholder.svg"}
                alt={departmentInfo.name}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{departmentInfo.name}</h2>
              <p className="text-sm text-gray-600">{departmentInfo.description}</p>
              <p className="mt-1 text-xs text-gray-500">{departmentInfo.memberCount} members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="sticky top-16 z-10 mx-auto flex w-full max-w-xs items-center justify-center gap-2 bg-primary-purple shadow-lg hover:bg-primary-purple/90 sm:w-auto">
        <Plus className="h-4 w-4" /> Create Department Post
      </Button>

      <div className="space-y-4">
        {departmentPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
