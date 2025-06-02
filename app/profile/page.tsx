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
    <Container>
      <div className="py-6">
        {/* Profile Header */}
        <div className="relative mb-6 rounded-xl bg-gradient-to-r from-primary-purple to-primary-purple/60 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-white">
                {userData.profileImage ? (
                  <AvatarImage src={userData.profileImage} alt={`${userData.firstName} ${userData.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-white text-primary-purple">
                    {userData.firstName[0]}
                    {userData.lastName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-white/90">
                  {userData.department} • {userData.year}
                </p>
                {userData.bio && (
                  <p className="mt-2 max-w-lg text-sm text-white/80">{userData.bio}</p>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">About Me</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p>{userData.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Year</h3>
                  <p>{userData.year}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Vibe</h3>
                  {userData.vibe ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{userData.vibe.emoji}</span>
                      <span>{userData.vibe.name}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">No vibe set</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="interests" className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {userData.interests?.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
                {(!userData.interests || userData.interests.length === 0) && (
                  <p className="text-gray-400">No interests added yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Connections</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/people">
                    <Users className="mr-2 h-4 w-4" />
                    Find People
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Following</p>
                      <p className="text-sm text-gray-500">
                        {userData.following?.length || 0} people
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Followers</p>
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
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Account Settings</p>
                    <p className="text-sm text-gray-500">
                      Update your account preferences
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">
                    Manage
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Sign Out</p>
                    <p className="text-sm text-gray-500">
                      Sign out of your account
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-500">Delete Account</p>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and data
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
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
