import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Paperclip, ImageIcon, Smile, Send, Info } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Chat header */}
      <div className="border-b bg-white p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-3 w-48" />
            </div>
            <Button variant="ghost" size="icon" disabled>
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-2xl space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                {i % 2 === 0 && <Skeleton className="mr-2 h-8 w-8 rounded-full" />}
                <Skeleton className={`h-20 max-w-[70%] rounded-lg ${i % 2 === 0 ? "w-64" : "w-48"}`} />
              </div>
            ))}
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t bg-white p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <ImageIcon className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="relative flex-1">
              <Skeleton className="h-10 w-full rounded-md" />
              <Button variant="ghost" size="icon" className="absolute right-0 top-0" disabled>
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            <Button size="icon" disabled>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
