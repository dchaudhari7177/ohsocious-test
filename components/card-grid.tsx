"use client"

import { cn } from "@/lib/utils"

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

export function CardGrid({
  children,
  columns = { default: 1 },
  className,
  ...props
}: CardGridProps) {
  const getGridCols = () => {
    const { default: defaultCols, sm, md, lg, xl } = columns
    return cn(
      `grid gap-4`,
      {
        "grid-cols-1": defaultCols === 1,
        "grid-cols-2": defaultCols === 2,
        "grid-cols-3": defaultCols === 3,
        "grid-cols-4": defaultCols === 4,
        "sm:grid-cols-2": sm === 2,
        "sm:grid-cols-3": sm === 3,
        "sm:grid-cols-4": sm === 4,
        "md:grid-cols-2": md === 2,
        "md:grid-cols-3": md === 3,
        "md:grid-cols-4": md === 4,
        "lg:grid-cols-2": lg === 2,
        "lg:grid-cols-3": lg === 3,
        "lg:grid-cols-4": lg === 4,
        "xl:grid-cols-2": xl === 2,
        "xl:grid-cols-3": xl === 3,
        "xl:grid-cols-4": xl === 4,
      }
    )
  }

  return (
    <div className={cn(getGridCols(), className)} {...props}>
      {children}
    </div>
  )
} 