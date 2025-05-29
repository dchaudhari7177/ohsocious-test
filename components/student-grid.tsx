import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, WavesIcon as Wave } from "lucide-react"
import Image from "next/image"

interface Student {
  id: string
  name: string
  avatar: string
  department: string
  year: string
  vibe: string
  bio: string
  interests: string[]
}

interface StudentGridProps {
  students: Student[]
}

export function StudentGrid({ students }: StudentGridProps) {
  if (students.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-center text-gray-500">No students match your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {students.map((student) => (
        <Card key={student.id} className="overflow-hidden">
          <div className="relative h-40 w-full">
            <Image src={student.avatar || "/placeholder.svg"} alt={student.name} fill className="object-cover" />
            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-sm">
              {student.vibe}
            </div>
          </div>
          <CardContent className="p-3">
            <div className="mb-2">
              <h3 className="font-medium">{student.name}</h3>
              <p className="text-xs text-gray-500">
                {student.department} • {student.year}
              </p>
            </div>

            <div className="mb-3 line-clamp-2 text-xs text-gray-700">{student.bio}</div>

            <div className="mb-3 flex flex-wrap gap-1">
              {student.interests.slice(0, 3).map((interest) => (
                <Badge key={interest} variant="secondary" className="bg-gray-100 text-xs text-gray-700">
                  {interest}
                </Badge>
              ))}
              {student.interests.length > 3 && (
                <Badge variant="secondary" className="bg-gray-100 text-xs text-gray-700">
                  +{student.interests.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600">
                <Wave className="mr-1 h-4 w-4" /> Wave
              </Button>
              <Button size="sm" className="flex-1 bg-primary-purple hover:bg-primary-purple/90">
                <Heart className="mr-1 h-4 w-4" /> Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
