"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth, db, storage } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { Camera } from "lucide-react"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userData: {
    firstName: string
    lastName: string
    department: string
    year: string
    bio: string
    profileImage?: string
    coverImage?: string
  }
  onUpdate: () => void
}

export function EditProfileModal({ isOpen, onClose, userData, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    department: userData.department,
    year: userData.year,
    bio: userData.bio
  })
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState(userData.profileImage)
  const [coverImagePreview, setCoverImagePreview] = useState(userData.coverImage)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.department || !formData.year) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user")

      const updates: Record<string, any> = {
        ...formData,
        updatedAt: new Date().toISOString()
      }

      // Upload profile image if changed
      if (profileImageFile) {
        const profileImageRef = ref(storage, `users/${user.uid}/profile-image`)
        await uploadBytes(profileImageRef, profileImageFile)
        const profileImageUrl = await getDownloadURL(profileImageRef)
        updates.profileImage = profileImageUrl
      }

      // Upload cover image if changed
      if (coverImageFile) {
        const coverImageRef = ref(storage, `users/${user.uid}/cover-image`)
        await uploadBytes(coverImageRef, coverImageFile)
        const coverImageUrl = await getDownloadURL(coverImageRef)
        updates.coverImage = coverImageUrl
      }

      // Update user document
      await updateDoc(doc(db, "users", user.uid), updates)

      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("An error occurred while updating your profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-48">
            {coverImagePreview && (
              <Image
                src={coverImagePreview}
                alt="Cover"
                fill
                className="object-cover"
              />
            )}
            <Label
              htmlFor="coverImage"
              className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Camera className="h-4 w-4" />
              Change Cover
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageChange}
              />
            </Label>
          </div>

          {/* Profile Image */}
          <div className="relative mx-auto h-24 w-24">
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
              {profileImagePreview && (
                <Image
                  src={profileImagePreview}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <Label
              htmlFor="profileImage"
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-purple text-white shadow-sm hover:bg-primary-purple/90"
            >
              <Camera className="h-4 w-4" />
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleSelectChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Medicine">Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select
              value={formData.year}
              onValueChange={(value) => handleSelectChange("year", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freshman">Freshman</SelectItem>
                <SelectItem value="Sophomore">Sophomore</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Graduate">Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="min-h-24"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary-purple hover:bg-primary-purple/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 