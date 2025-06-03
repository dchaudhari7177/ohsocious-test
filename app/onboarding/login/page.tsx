"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, sendPasswordResetEmail, Auth, fetchSignInMethodsForEmail } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { Logo } from "@/components/ui/logo"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { SocialAuthButtons } from "@/components/ui/social-auth-buttons"
import { Separator } from "@/components/ui/separator"
import { LockKeyhole, Mail } from "lucide-react"
import { signInWithGoogle } from "@/lib/google-auth"
import { doc, getDoc } from "firebase/firestore"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      
      const { user, error } = await signInWithGoogle(false)
      
      if (error) {
        if (error === "Sign-in cancelled") {
          return // Don't show error for cancelled sign-in
        }
        setError(error)
        return
      }
      
      if (user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in with Google",
        })
        router.push("/feed")
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      setError(error.message || "An error occurred during sign-in")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      const trimmedEmail = email.toLowerCase().trim()

      // Validate .edu email
      if (!trimmedEmail.endsWith('.edu')) {
        setError("Please use a college email address (.edu)")
        setLoading(false)
        return
      }

      // Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password)
      const user = userCredential.user

      if (!user) {
        setError("Failed to sign in. Please try again.")
        return
      }

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (!userDoc.exists()) {
        // If user exists in Auth but not in Firestore, they need to complete signup
        await auth.signOut()
        setError("Please complete the signup process first")
        return
      }

      // Check if email is verified
      if (!user.emailVerified) {
        router.push(`/onboarding/verify?email=${encodeURIComponent(trimmedEmail)}`)
        return
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in",
      })

      // Add a small delay before redirecting to ensure auth state is properly updated
      setTimeout(() => {
        router.push("/feed")
      }, 500)

    } catch (error: any) {
      console.error("Login error:", error)
      
      // More specific error messages
      const errorMessage = 
        error.code === "auth/invalid-credential" ? "Invalid email or password" :
        error.code === "auth/invalid-email" ? "Invalid email format" :
        error.code === "auth/user-disabled" ? "This account has been disabled" :
        error.code === "auth/too-many-requests" ? "Too many failed attempts. Please try again later." :
        "An error occurred during login. Please try again."
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetting(true)
    setError("")

    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      })
      setIsResetting(false)
      return
    }

    try {
      const trimmedEmail = resetEmail.toLowerCase().trim()

      // Validate .edu email
      if (!trimmedEmail.endsWith('.edu')) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Please use a college email address (.edu)",
        })
        setIsResetting(false)
        return
      }

      // Try to sign in to check if user exists (will fail with wrong password but that's ok)
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, "dummy-password")
      } catch (signInError: any) {
        // If error is invalid password, user exists
        if (signInError.code !== "auth/invalid-credential") {
          toast({
            variant: "destructive",
            title: "Account Not Found",
            description: "No account found with this email. Please sign up first.",
          })
          setIsResetting(false)
          return
        }
      }

      // Configure action code settings
      const actionCodeSettings = {
        url: `${window.location.protocol}//${window.location.host}/onboarding/login`,
        handleCodeInApp: false
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, trimmedEmail, actionCodeSettings)
      
      // Close dialog and show success message
      setIsResetDialogOpen(false)
      setResetEmail("")
      
      toast({
        title: "Reset email sent",
        description: "Check your email (including spam folder) for password reset instructions. The email should arrive within a few minutes.",
        duration: 6000,
      })
    } catch (error: any) {
      console.error("Reset password error:", error)
      
      const errorMessage = 
        error.code === "auth/invalid-email" ? "Invalid email format" :
        error.code === "auth/user-not-found" ? "No account found with this email" :
        error.code === "auth/too-many-requests" ? "Too many requests. Please try again later." :
        error.code === "auth/network-request-failed" ? "Network error. Please check your internet connection." :
        "Failed to send reset email. Please try again."

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setIsResetting(false)
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
                  Welcome Back
                </CardTitle>
              </motion.div>
              <CardDescription className="text-gray-600">
                Sign in with your college email
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
                    <span className="bg-white/80 px-2 text-gray-500">Or continue with email</span>
                  </div>
                </div>
              </motion.div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="px-0 font-normal text-primary-purple hover:text-pink-500 transition-colors">
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we&apos;ll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="resetEmail">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="resetEmail"
                                type="email"
                                placeholder="your.email@college.edu"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                className="h-12 pl-10"
                              />
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full h-12 bg-primary-purple hover:bg-primary-purple/90"
                            disabled={isResetting}
                          >
                            {isResetting ? (
                              <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                Sending...
                              </span>
                            ) : (
                              "Send Reset Link"
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                        Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="mt-6 text-center text-gray-600"
                >
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/onboarding/signup" 
                    className="text-primary-purple hover:text-pink-500 transition-colors font-medium"
                  >
                    Sign up
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