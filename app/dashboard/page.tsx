import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, X } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rose-600">CampusMatch</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MessageCircle className="h-6 w-6 text-rose-500" />
        </Button>
      </header>

      <main className="flex-1">
        <Card className="mx-auto max-w-md overflow-hidden rounded-xl shadow-lg">
          <div className="relative aspect-[3/4] w-full">
            <Image src="/placeholder.svg?height=600&width=450" alt="Profile" fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">Jessica, 21</h2>
              <p className="text-sm">Computer Science • Junior</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs">Photography</span>
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs">Hiking</span>
                <span className="rounded-full bg-white/20 px-2 py-1 text-xs">Coffee</span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">
              Looking for someone to explore the city with and grab coffee between classes. Photography enthusiast and
              hiking addict!
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <Button size="lg" variant="outline" className="rounded-full h-16 w-16">
                <X className="h-8 w-8 text-gray-500" />
              </Button>
              <Button size="lg" className="rounded-full h-16 w-16 bg-rose-500 hover:bg-rose-600">
                <Heart className="h-8 w-8" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
