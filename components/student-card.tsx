import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface StudentCardProps {
  student: Student
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="relative aspect-[3/4] w-full">
        <Image src={student.avatar || "/placeholder.svg"} alt={student.name} fill className="object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xl">
              {student.vibe}
            </div>
          </div>
          <p className="text-sm text-white/90">
            {student.department} • {student.year}
          </p>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-gray-700">{student.bio}</p>

        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Interests</p>
          <div className="flex flex-wrap gap-2">
            {student.interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="bg-primary-purple/10 text-primary-purple hover:bg-primary-purple/20"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
