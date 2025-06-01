"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    year: "",
    bio: ""
  })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.department || !formData.year) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user found")
      }

      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        year: formData.year,
        bio: formData.bio,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      })

      // Redirect to vibe selection page
      router.push("/onboarding/vibe")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("An error occurred while saving your profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
        <p className="text-sm text-gray-600">Tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-medium">
            Department
          </Label>
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
          <Label htmlFor="year" className="text-sm font-medium">
            Year
          </Label>
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
          <Label htmlFor="bio" className="text-sm font-medium">
            Bio <span className="text-xs text-gray-500">(optional)</span>
          </Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            className="min-h-24"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full bg-primary-purple hover:bg-primary-purple/90" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Saving Profile...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Complete Setup <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
