import type { ReactNode } from "react"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg">
      <div className="container max-w-md px-4 py-8">{children}</div>
    </div>
  )
}
