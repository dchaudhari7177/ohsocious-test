"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, sendEmailVerification, setPersistence, browserLocalPersistence, fetchSignInMethodsForEmail } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ImageUpload } from "@/components/image-upload"
import { motion } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { Logo } from "@/components/ui/logo"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { SocialAuthButtons } from "@/components/ui/social-auth-buttons"
import { Separator } from "@/components/ui/separator"
import { LockKeyhole, Mail, User2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PasswordStrength } from "@/components/ui/password-strength"
import { signInWithGoogle } from "@/lib/google-auth"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const router = useRouter()
  const { refreshUserData } = useAuth()
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    // Basic email validation
    if (!email.includes("@")) return false
    
    // Check for .edu domain
    const domain = email.split("@")[1]
    return domain.toLowerCase().endsWith(".edu")
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        // Check if the base64 string is too large (max 1MB)
        if (base64String.length > 1024 * 1024) {
          reject(new Error("Image size too large. Please choose a smaller image."))
          return
        }
        resolve(base64String)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const handleImageSelect = (file: File) => {
    setProfileImage(file)
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      
      const { user, error, isNewUser } = await signInWithGoogle(true)
      
      if (error) {
        if (error === "Sign-in cancelled") {
          return // Don't show error for cancelled sign-in
        }
        setError(error)
        return
      }
      
      if (user) {
        toast({
          title: isNewUser ? "Welcome!" : "Welcome back!",
          description: isNewUser 
            ? "Your account has been created successfully" 
            : "Successfully signed in with Google",
        })
        router.push("/feed")
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      setError(error.message || "An error occurred during sign-up")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Validate form
      if (!email || !password || !confirmPassword) {
        setError("All fields are required")
        return
      }

      if (!validateEmail(email)) {
        setError("Please use a valid .edu email address")
        return
      }

      // Check if email already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email)
      if (signInMethods.length > 0) {
        setError("An account with this email already exists. Please sign in instead.")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }

      // Password strength validation
      const hasNumber = /\d/.test(password)
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      const hasUpperLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password)

      if (!hasNumber || !hasSpecial || !hasUpperLower) {
        setError("Password must include numbers, special characters, and both uppercase and lowercase letters")
        return
      }

      setLoading(true)

      // Ensure we're using local persistence
      await setPersistence(auth, browserLocalPersistence)
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Convert profile image to base64 if selected
      let profileImageData = ""
      if (profileImage) {
        try {
          profileImageData = await convertImageToBase64(profileImage)
        } catch (error: any) {
          setError(error.message)
          setLoading(false)
          return
        }
      }

      // Send verification email
      await sendEmailVerification(user)

      // Create initial user document
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        emailVerified: false,
        profileImage: profileImageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Refresh user data in context
      await refreshUserData()

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })

      // Redirect to verify page with email
      const redirectUrl = `/onboarding/verify?email=${encodeURIComponent(email)}`
      router.push(redirectUrl)
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(
        error.code === "auth/email-already-in-use"
          ? "This email is already registered"
          : error.code === "auth/network-request-failed"
          ? "Network error. Please check your connection."
          : error.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : "An error occurred during signup"
      )
    } finally {
      setLoading(false)
    }
  }

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      <AnimatedBackground />
      <div className="relative z-10 container flex min-h-screen items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <Card className="w-full backdrop-blur-xl bg-white/80 shadow-2xl border-0">
            <CardHeader className="space-y-1 text-center pb-6">
              <motion.div variants={itemVariants} className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <Logo />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-pink-500 bg-clip-text text-transparent">
                  Create Account
                </CardTitle>
              </motion.div>
              <CardDescription className="text-gray-600">
                Join with your college email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={itemVariants}>
                <SocialAuthButtons 
                  className="mb-6"
                  onGoogleClick={handleGoogleSignIn}
                />
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-gray-500">Or sign up with email</span>
                  </div>
                </div>
              </motion.div>

              <form onSubmit={handleEmailSignUp} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="relative group">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    className="mb-4 relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 transition-all hover:border-primary-purple p-4 text-center group-hover:bg-primary-purple/5"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email">College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-10"
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pl-10"
                    />
                  </div>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PasswordStrength password={password} />
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 pl-10"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary-purple hover:bg-primary-purple/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Creating account...
                      </span>
                    ) : (
                      "Sign up"
                    )}
                  </Button>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="mt-6 text-center text-gray-600"
                >
                  Already have an account?{" "}
                  <Link 
                    href="/onboarding/login" 
                    className="text-primary-purple hover:text-pink-500 transition-colors font-medium"
                  >
                    Sign in
                  </Link>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
