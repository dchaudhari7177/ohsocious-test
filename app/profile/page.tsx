"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Container } from "@/components/ui/container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, LogOut, Settings, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { deleteDoc, doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/onboarding/login")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/onboarding/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      setIsDeleting(true)
      // Delete user document
      await deleteDoc(doc(db, "users", user.uid))
      // Delete user auth account
      await user.delete()
      router.push("/onboarding/signup")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading || !userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-purple border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Container className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4 sm:py-6 space-y-6">
        {/* Profile Header */}
        <div className="relative rounded-xl bg-gradient-to-r from-primary-purple to-primary-purple/60 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-white shrink-0">
                {userData.profileImage ? (
                  <AvatarImage 
                    src={userData.profileImage} 
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="object-cover" 
                  />
                ) : (
                  <AvatarFallback className="bg-white text-primary-purple text-xl sm:text-2xl">
                    {userData.firstName[0]}
                    {userData.lastName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-white/90 text-sm sm:text-base">
                  {userData.department} • {userData.year}
                </p>
                {userData.bio && (
                  <p className="mt-2 max-w-lg text-sm sm:text-base text-white/80">{userData.bio}</p>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto shadow-sm" asChild>
              <Link href="/settings">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList className="w-full flex justify-start space-x-4 sm:space-x-8 overflow-x-auto pb-2">
            <TabsTrigger value="about" className="text-sm sm:text-base">About</TabsTrigger>
            <TabsTrigger value="interests" className="text-sm sm:text-base">Interests</TabsTrigger>
            <TabsTrigger value="connections" className="text-sm sm:text-base">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <h2 className="mb-4 text-lg sm:text-xl font-semibold">About Me</h2>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <h3 className="text-sm font-medium text-gray-500 sm:w-32">Department</h3>
                  <p className="text-sm sm:text-base">{userData.department}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <h3 className="text-sm font-medium text-gray-500 sm:w-32">Year</h3>
                  <p className="text-sm sm:text-base">{userData.year}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <h3 className="text-sm font-medium text-gray-500 sm:w-32">Vibe</h3>
                  {userData.vibe ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{userData.vibe.emoji}</span>
                      <span className="text-sm sm:text-base">{userData.vibe.name}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm sm:text-base">No vibe set</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="interests" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <h2 className="mb-4 text-lg sm:text-xl font-semibold">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {userData.interests?.map((interest) => (
                  <Badge 
                    key={interest} 
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                  >
                    {interest}
                  </Badge>
                ))}
                {(!userData.interests || userData.interests.length === 0) && (
                  <p className="text-gray-400 text-sm sm:text-base">No interests added yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Connections</h2>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href="/people">
                    <Users className="mr-2 h-4 w-4" />
                    Find People
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Following</p>
                      <p className="text-sm text-gray-500">
                        {userData.following?.length || 0} people
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Followers</p>
                      <p className="text-sm text-gray-500">
                        {userData.followers?.length || 0} people
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Actions */}
        <div className="mt-6 space-y-4">
          <Card className="p-4 sm:p-6">
            <h2 className="mb-6 text-lg sm:text-xl font-semibold">Account Settings</h2>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-500 shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Account Settings</p>
                    <p className="text-sm text-gray-500">
                      Update your account preferences
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href="/settings">
                    Manage
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <LogOut className="h-5 w-5 text-gray-500 shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Sign Out</p>
                    <p className="text-sm text-gray-500">
                      Sign out of your account
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto"
                >
                  Sign Out
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500 shrink-0 mt-1 sm:mt-0" />
                  <div>
                    <p className="font-medium text-red-500 text-sm sm:text-base">Delete Account</p>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and data
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  )
}
