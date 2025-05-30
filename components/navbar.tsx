"use client"

import { Bell, Menu, Search, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="mt-6 flex flex-col gap-4">
                <Link
                  href="/feed"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">🏠</div>
                  <span>Home</span>
                </Link>
                <Link
                  href="/discover"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">👋</div>
                  <span>Discover Students</span>
                </Link>
                <Link
                  href="/groups"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">👥</div>
                  <span>Groups & Clubs</span>
                </Link>
                <Link
                  href="/events"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">🎉</div>
                  <span>Events</span>
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">💬</div>
                  <span>Chat</span>
                </Link>
                <div className="my-2 border-t"></div>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">👤</div>
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <div className="text-lg">⚙️</div>
                  <span>Settings</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/feed" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="ohsocious logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="hidden text-xl font-bold text-primary-purple md:inline-block">
              ohso<span className="text-secondary-pink">cious</span>
            </span>
          </Link>
        </div>

        <div className="hidden flex-1 max-w-md px-4 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search ohsocious..."
              className="w-full rounded-full border-gray-200 bg-gray-50 pl-10 pr-4"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <>
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-pink text-[10px] text-white">
                  3
                </span>
              </>
            </Link>
          </Button>

          {/* Chat link for desktop */}
          <Button variant="ghost" size="icon" asChild className="hidden md:flex items-center justify-center">
            <Link href="/chat">
              <MessageSquare className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t bg-white p-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search ohsocious..."
              className="w-full rounded-full border-gray-200 bg-gray-50 pl-10 pr-4"
            />
          </div>
        </div>
      )}
    </header>
  )
}
