"use client"

import { useState } from "react"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"

// Sample polls and questions
const pollsAndQuestions = [
  {
    id: "1",
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
    },
    comments: 7,
  },
  {
    id: "2",
    type: "normal",
    user: {
      name: "Jamie Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Psychology",
    },
    content:
      "Has anyone taken Professor Johnson's Cognitive Psychology course? I'm considering it for next semester but heard the workload is intense. Any advice?",
    timestamp: "8 hours ago",
    reactions: {
      "🔥": 5,
      "😂": 0,
      "❤️": 3,
      "🫶": 1,
    },
    comments: 15,
  },
  {
    id: "3",
    type: "poll",
    user: {
      name: "Alex Rivera",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Engineering",
    },
    content: "Which programming language do you find most useful for your major?",
    options: [
      { text: "Python", votes: 87 },
      { text: "Java", votes: 42 },
      { text: "C++", votes: 35 },
      { text: "JavaScript", votes: 56 },
      { text: "MATLAB", votes: 23 },
    ],
    timestamp: "1 day ago",
    reactions: {
      "🔥": 18,
      "😂": 2,
      "❤️": 10,
      "🫶": 5,
    },
    comments: 12,
  },
]

export default function PollsQuestionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("poll")

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", ""])

  // Question state
  const [question, setQuestion] = useState("")

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions]
      newOptions.splice(index, 1)
      setPollOptions(newOptions)
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const handleSubmit = () => {
    if (activeTab === "poll") {
      // Submit poll
      console.log({
        type: "poll",
        question: pollQuestion,
        options: pollOptions.filter((option) => option.trim() !== ""),
      })
    } else {
      // Submit question
      console.log({
        type: "question",
        content: question,
      })
    }

    // Reset form and close dialog
    setPollQuestion("")
    setPollOptions(["", ""])
    setQuestion("")
    setIsDialogOpen(false)
  }

  const isSubmitDisabled = () => {
    if (activeTab === "poll") {
      return !pollQuestion.trim() || pollOptions.filter((option) => option.trim() !== "").length < 2
    } else {
      return !question.trim()
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="sticky top-16 z-10 mx-auto flex w-full max-w-xs items-center justify-center gap-2 bg-primary-purple shadow-lg hover:bg-primary-purple/90 sm:w-auto">
            <Plus className="h-4 w-4" /> Create Poll or Question
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Poll or Ask a Question</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="poll" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="poll">Poll</TabsTrigger>
              <TabsTrigger value="question">Question</TabsTrigger>
            </TabsList>

            <TabsContent value="poll" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question">Poll Question</Label>
                <Input
                  id="poll-question"
                  placeholder="Ask something..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Options</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePollOption(index)}
                        className="h-8 w-8 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 10 && (
                  <Button variant="outline" size="sm" onClick={addPollOption} className="w-full">
                    Add Option
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="question" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="question-content">Your Question</Label>
                <Textarea
                  id="question-content"
                  placeholder="What would you like to ask the community?"
                  className="min-h-32"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary-purple hover:bg-primary-purple/90"
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {pollsAndQuestions.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
