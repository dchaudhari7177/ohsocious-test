"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export interface Tab {
  label: string
  href: string
}

interface TabNavProps {
  tabs?: Tab[]
  activeTab?: string
}

const defaultTabs: Tab[] = [
  { label: "All Feed", href: "/feed" },
  { label: "Discover", href: "/discover" },
  { label: "My Department", href: "/feed/department" },
  { label: "Confessions", href: "/feed/confessions" },
  { label: "Polls & Questions", href: "/feed/polls" },
]

export function TabNav({ tabs = defaultTabs, activeTab }: TabNavProps) {
  const pathname = usePathname()
  const currentTab = activeTab || tabs.find(tab => tab.href === pathname)?.label || tabs[0].label

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex w-full overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`relative flex min-w-fit flex-shrink-0 items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                (activeTab ? activeTab === tab.label : pathname === tab.href)
                  ? "text-primary-purple"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {(activeTab ? activeTab === tab.label : pathname === tab.href) && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary-purple" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
