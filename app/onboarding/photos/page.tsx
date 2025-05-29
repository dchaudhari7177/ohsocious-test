"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function PhotosPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newPhotos = [...photos]

      Array.from(e.dataTransfer.files).forEach((file) => {
        if (file.type.startsWith("image/") && newPhotos.length < 6) {
          const url = URL.createObjectURL(file)
          newPhotos.push(url)
        }
      })

      setPhotos(newPhotos)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = [...photos]

      Array.from(e.target.files).forEach((file) => {
        if (file.type.startsWith("image/") && newPhotos.length < 6) {
          const url = URL.createObjectURL(file)
          newPhotos.push(url)
        }
      })

      setPhotos(newPhotos)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos.splice(index, 1)
    setPhotos(newPhotos)
  }

  const handleContinue = () => {
    if (photos.length > 0) {
      router.push("/onboarding/interests")
    }
  }

  return (
    <div className="space-y-6">
      <Progress value={60} className="h-2 bg-gray-100" />

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Upload Your Photos</h2>
        <p className="text-sm text-gray-500">Add up to 6 photos to your profile</p>
      </div>

      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center ${dragging ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <Upload className="mb-2 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-sm font-medium">Drag and drop your photos here</p>
          <p className="mb-4 text-xs text-gray-500">or</p>
          <Button variant="outline" className="relative" size="sm">
            <input
              type="file"
              className="absolute inset-0 cursor-pointer opacity-0"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            Browse Files
          </Button>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Uploaded Photos ({photos.length}/6)</h3>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                <Image
                  src={photo || "/placeholder.svg"}
                  alt={`Uploaded photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" asChild>
          <Link href="/onboarding/campus-details">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <Button
          onClick={handleContinue}
          disabled={photos.length === 0}
          className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300"
        >
          <span className="flex items-center gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}
