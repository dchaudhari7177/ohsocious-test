"use client"

import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  backButton?: {
    href: string
    label?: string
  }
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  backButton,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-4 md:pb-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {backButton && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              asChild
            >
              <Link href={backButton.href}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-4">{actions}</div>
        )}
      </div>
      {backButton && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden items-center gap-2 md:inline-flex"
          asChild
        >
          <Link href={backButton.href}>
            <ArrowLeft className="h-4 w-4" />
            {backButton.label || "Back"}
          </Link>
        </Button>
      )}
    </div>
  )
} 