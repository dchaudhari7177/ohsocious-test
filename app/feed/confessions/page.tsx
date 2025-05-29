"use client"

import { useState } from "react"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample confession posts
const confessionPosts = [
  {
    id: "1",
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
    },
    comments: 32,
  },
  {
    id: "2",
    type: "confession",
    anonymousAvatar: "🦄",
    anonymousName: "Secret Unicorn",
    content:
      "I have a huge crush on someone in my study group but I'm too scared to say anything. We've been friends for 2 years now...",
    timestamp: "5 hours ago",
    reactions: {
      "🔥": 23,
      "😂": 5,
      "❤️": 89,
      "🫶": 45,
    },
    comments: 27,
  },
  {
    id: "3",
    type: "confession",
    anonymousAvatar: "🦊",
    anonymousName: "Sneaky Fox",
    content:
      "I accidentally submitted a meme instead of my assignment and the professor gave me extra credit for 'creative thinking' 💀",
    timestamp: "1 day ago",
    reactions: {
      "🔥": 120,
      "😂": 234,
      "❤️": 56,
      "🫶": 12,
    },
    comments: 45,
  },
]

// Sample hashtags
const popularHashtags = [
  "CampusLife",
  "StudyProblems",
  "DormStories",
  "ProfessorFails",
  "ClassCrush",
  "MidtermMadness",
  "CafeteriaFood",
]

export default function ConfessionsFeedPage() {
  const [confession, setConfession] = useState("")
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const moods = ["😊", "😂", "😅", "😭", "😍", "🤔", "😱", "🙄", "😴", "🥺"]

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

  const handleSubmit = () => {
    // In a real app, this would send the confession to the backend
    console.log({
      confession,
      mood: selectedMood,
      hashtags: selectedHashtags,
    })

    // Reset form and close dialog
    setConfession("")
    setSelectedMood(null)
    setSelectedHashtags([])
    setIsDialogOpen(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="sticky top-16 z-10 mx-auto flex w-full max-w-xs items-center justify-center gap-2 bg-primary-purple shadow-lg hover:bg-primary-purple/90 sm:w-auto">
            <Plus className="h-4 w-4" /> Confess Something...
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
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                      selectedMood === mood ? "bg-primary-purple/20 ring-2 ring-primary-purple" : "bg-gray-100"
                    }`}
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
                    className={`cursor-pointer ${
                      selectedHashtags.includes(hashtag)
                        ? "bg-primary-purple hover:bg-primary-purple/90"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleHashtag(hashtag)}
                  >
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                Your confession will be posted anonymously. However, abusive or harmful content will be removed and may
                result in account suspension.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-primary-purple hover:bg-primary-purple/90"
                onClick={handleSubmit}
                disabled={!confession.trim()}
              >
                Post Anonymously
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {confessionPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
