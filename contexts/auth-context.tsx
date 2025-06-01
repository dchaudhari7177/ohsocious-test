"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User, setPersistence, browserLocalPersistence, getAuth } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, usePathname } from "next/navigation"

interface UserData {
  firstName: string
  lastName: string
  department: string
  year: string
  bio: string
  profileImage?: string
  coverImage?: string
  vibe?: { emoji: string; name: string }
  interests?: string[]
  connectionsCount?: number
  emailVerified: boolean
  createdAt: string
  updatedAt?: string
  profileCompleted?: boolean
  vibeCompleted?: boolean
  interestsCompleted?: boolean
  onboardingCompleted?: boolean
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
})

const publicRoutes = [
  "/onboarding/login",
  "/onboarding/signup",
  "/onboarding/verify",
]

const onboardingRoutes = [
  "/onboarding/profile",
  "/onboarding/vibe",
  "/onboarding/interests",
  "/onboarding/welcome",
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRouting, setIsRouting] = useState(false)
  const [lastRoutingTime, setLastRoutingTime] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Handle onboarding routing with debounce
  const handleOnboardingRouting = async (user: User, userData: UserData | null) => {
    // Prevent routing if less than 2 seconds have passed since last routing
    const now = Date.now()
    if (now - lastRoutingTime < 2000) return
    
    if (isRouting) return // Prevent multiple simultaneous routing attempts
    setIsRouting(true)
    setLastRoutingTime(now)

    try {
      // If on a public route but user is fully onboarded, go to feed
      if (userData?.onboardingCompleted && (publicRoutes.includes(pathname) || onboardingRoutes.includes(pathname))) {
        await router.push("/feed")
        return
      }

      // Special handling for verify page to prevent loops
      if (!user.emailVerified) {
        if (!pathname.includes("/onboarding/verify")) {
          const currentEmail = user.email || ""
          await router.push(`/onboarding/verify?email=${encodeURIComponent(currentEmail)}`)
        }
        return // Don't proceed with other routing if email isn't verified
      }

      // Only proceed with onboarding routing if email is verified
      if (user.emailVerified) {
        // If no user data or profile not completed, go to profile setup
        if (!userData?.profileCompleted && !pathname.includes("/onboarding/profile")) {
          await router.push("/onboarding/profile")
          return
        }

        if (userData?.profileCompleted && !userData.vibeCompleted && !pathname.includes("/onboarding/vibe")) {
          await router.push("/onboarding/vibe")
          return
        }

        if (userData?.vibeCompleted && !userData.interestsCompleted && !pathname.includes("/onboarding/interests")) {
          await router.push("/onboarding/interests")
          return
        }

        if (userData?.interestsCompleted && !userData.onboardingCompleted && !pathname.includes("/onboarding/welcome")) {
          await router.push("/onboarding/welcome")
          return
        }

        // If everything is completed and still on onboarding routes, go to feed
        if (userData?.onboardingCompleted && (publicRoutes.includes(pathname) || onboardingRoutes.includes(pathname))) {
          await router.push("/feed")
          return
        }
      }
    } catch (error) {
      console.error("Error in onboarding routing:", error)
    } finally {
      setIsRouting(false)
    }
  }

  // Initialize Firebase Auth persistence and handle auth state changes
  useEffect(() => {
    let isInitialized = false
    let lastAuthCheck = 0
    
    const initializeAuth = async () => {
      if (isInitialized) return
      isInitialized = true
      
      try {
        await setPersistence(auth, browserLocalPersistence)
        
        const currentUser = auth.currentUser
        if (currentUser) {
          setUser(currentUser)
          await fetchUserData(currentUser)
        }
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          // Debounce auth state changes
          const now = Date.now()
          if (now - lastAuthCheck < 2000) return
          lastAuthCheck = now
          
          console.log("Auth state changed:", user?.email)
          
          if (user) {
            setUser(user)
            await fetchUserData(user)
          } else {
            setUser(null)
            setUserData(null)
            if (!publicRoutes.includes(pathname)) {
              await router.push("/onboarding/login")
            }
          }
          
          setLoading(false)
        })

        return () => {
          unsubscribe()
          isInitialized = false
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [pathname, router])

  // Handle route protection and onboarding flow with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleRouting = () => {
      if (!loading && !isRouting) {
        if (!user && !publicRoutes.includes(pathname)) {
          router.push("/onboarding/login")
        } else if (user) {
          handleOnboardingRouting(user, userData)
        }
      }
    }

    // Debounce the routing check
    timeoutId = setTimeout(handleRouting, 1000)

    return () => clearTimeout(timeoutId)
  }, [user, userData, loading, pathname, router, isRouting])

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 