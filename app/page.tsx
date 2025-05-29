"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Flame } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SplashScreen() {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gradient-bg">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 text-white">
        <div className={`flex flex-col items-center ${animationComplete ? "bounce-in" : "opacity-0"}`}>
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            <Image
              src="/placeholder.svg?height=160&width=160"
              alt="ohsocious logo"
              width={160}
              height={160}
              className="object-contain"
            />
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            ohso<span className="text-secondary-pink">cious</span>
          </h1>
          <p className="mt-2 text-lg text-white/80">Campus-exclusive socializing</p>
        </div>

        <Button
          asChild
          size="lg"
          className={`mt-8 bg-white px-8 text-primary-purple hover:bg-white/90 ${
            animationComplete ? "slide-up" : "opacity-0"
          }`}
        >
          <Link href="/onboarding/signup" className="flex items-center gap-2 text-lg font-medium">
            Let&apos;s Go <Flame className="h-5 w-5 text-secondary-pink" />
          </Link>
        </Button>
      </div>
    </main>
  )
}
