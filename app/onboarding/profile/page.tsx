"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.year) newErrors.year = "Year is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/onboarding/vibe")
    }, 1000)
  }

  return (
    <div className="w-full space-y-6 rounded-xl bg-white p-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
        <p className="text-sm text-gray-600">Tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-medium">
            Department
          </Label>
          <Input
            id="department"
            placeholder="Computer Science"
            value={formData.department}
            onChange={(e) => handleChange("department", e.target.value)}
            className={errors.department ? "border-red-500" : ""}
          />
          {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium">
            Year
          </Label>
          <Select onValueChange={(value) => handleChange("year", value)}>
            <SelectTrigger className={errors.year ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freshman">Freshman</SelectItem>
              <SelectItem value="sophomore">Sophomore</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
          {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
        </div>

        <Button type="submit" className="w-full bg-primary-purple hover:bg-primary-purple/90" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
