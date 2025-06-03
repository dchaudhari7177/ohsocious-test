// components/create-post.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImagePlus, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export function CreatePost({ postType = "normal" }: { postType?: "normal" | "confession" }) {
  const { user, userData } = useAuth()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Debug logs
  useEffect(() => {
    console.log("CreatePost Component:", {
      user: user?.email,
      userData: userData,
      hasContent: !!content,
      hasImage: !!image
    })
  }, [user, userData, content, image])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setIsLoading(true)
    try {
      let imageUrl = null

      // Upload image if exists
      if (image) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${image.name}`)
        await uploadBytes(storageRef, image)
        imageUrl = await getDownloadURL(storageRef)
      }

      // Create post
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        content: content.trim(),
        image: imageUrl,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        type: postType,
        reactions: {},
        user: {
          name: `${userData?.firstName} ${userData?.lastName}`,
          avatar: userData?.profileImage,
          department: userData?.department
        }
      })

      // Reset form
      setContent("")
      setImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debug log for component mount
  console.log("CreatePost rendering with:", { user: !!user, userData: !!userData })

  return (
    <Card className={`mb-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow${postType === "confession" ? " bg-gradient-to-r from-purple-100 via-purple-50 to-pink-100 border-2 border-purple-300 shadow-lg" : ""}`}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-4">
          <Avatar>
            {userData?.profileImage ? (
              <AvatarImage src={userData.profileImage} alt={userData.firstName} />
            ) : (
              <AvatarFallback>{userData?.firstName?.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            {postType === "confession" && (
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block text-3xl animate-bounce animate-spin-slow" style={{ animationDuration: '2s', display: 'inline-block', transform: 'rotate(-10deg)' }}>👻</span>
                <span className="text-purple-800 font-bold text-lg drop-shadow-sm">Confession Mode: <span className="font-semibold">You are posting anonymously.</span></span>
              </div>
            )}
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 focus:border-primary-purple"
            />
            {imagePreview && (
              <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => setImagePreview(null)}
                >
                  Remove
                </Button>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-gray-50"
                  >
                    <ImagePlus className="h-5 w-5" />
                    Add Image
                  </Button>
                </label>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !content.trim()}
                className="bg-primary-purple hover:bg-primary-purple/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  )
}