"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Menu, Home, Users, MessageSquare, Bell, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"

const navigationItems = [
  {
    name: "Feed",
    href: "/feed",
    icon: Home,
  },
  {
    name: "Messages",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "People",
    href: "/people",
    icon: Users,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
]

export function Navigation() {
  const { user, userData } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user || !userData) return null

  const initials = `${userData.firstName?.[0]}${userData.lastName?.[0]}`

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-purple">Ohsocious</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2",
                    pathname === item.href && "bg-gray-100"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.profileImage} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">
                    {userData.firstName} {userData.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.uid}`} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={userData.profileImage} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>
                        {userData.firstName} {userData.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        View Profile
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:bg-red-50 focus:text-red-500"
                  onClick={() => auth.signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className={cn(
                          "justify-start",
                          pathname === item.href && "bg-gray-100"
                        )}
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href={item.href}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      </Button>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  )
} 