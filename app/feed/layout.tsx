import type { ReactNode } from "react"
import { TabNav } from "@/components/tab-nav"

export default function FeedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TabNav />
      <main className="flex-1 px-4 pb-20 pt-4">{children}</main>
    </div>
  )
}
