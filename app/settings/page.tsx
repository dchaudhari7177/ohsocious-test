"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, LogOut, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { signOut, deleteUser } from "firebase/auth"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, userData, refreshUserData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    department: userData?.department || "",
    year: userData?.year || "",
    bio: userData?.bio || "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    mentions: true,
    connections: true,
    events: true,
    confessions: false,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "everyone",
    showDepartment: true,
    showInterests: true,
    allowMessages: "connections",
  })

  const [loading, setLoading] = useState(false)

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      })
      
      await refreshUserData()
      
      toast({
        title: "Success",
        description: "Profile settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationSettings,
        updatedAt: new Date().toISOString()
      })
      
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating notifications:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        privacySettings,
        updatedAt: new Date().toISOString()
      })
      
      toast({
        title: "Success",
        description: "Privacy settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating privacy:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update privacy settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/onboarding/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const user = auth.currentUser
      if (!user) return

      // Delete user's posts
      const postsQuery = query(collection(db, "posts"), where("userId", "==", user.uid))
      const postsSnapshot = await getDocs(postsQuery)
      const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Delete user document
      await deleteDoc(doc(db, "users", user.uid))

      // Delete Firebase Auth account
      await deleteUser(user)

      // Redirect to login
      router.push("/onboarding/login")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={formData.year}
                  onValueChange={(value) => handleSelectChange("year", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="min-h-24"
                />
              </div>

              <Button 
                className="w-full bg-primary-purple hover:bg-primary-purple/90"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" /> 
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Button className="w-full bg-primary-purple hover:bg-primary-purple/90">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Deleting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Delete Account
                          </span>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Direct Messages</p>
                  <p className="text-sm text-gray-500">Get notified when you receive a message</p>
                </div>
                <Switch
                  checked={notificationSettings.messages}
                  onCheckedChange={() => handleNotificationToggle("messages")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mentions</p>
                  <p className="text-sm text-gray-500">Get notified when someone mentions you</p>
                </div>
                <Switch
                  checked={notificationSettings.mentions}
                  onCheckedChange={() => handleNotificationToggle("mentions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Connections</p>
                  <p className="text-sm text-gray-500">Get notified when someone connects with you</p>
                </div>
                <Switch
                  checked={notificationSettings.connections}
                  onCheckedChange={() => handleNotificationToggle("connections")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Event Invitations</p>
                  <p className="text-sm text-gray-500">Get notified about event invites</p>
                </div>
                <Switch
                  checked={notificationSettings.events}
                  onCheckedChange={() => handleNotificationToggle("events")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Confession Replies</p>
                  <p className="text-sm text-gray-500">Get notified when someone replies to your confession</p>
                </div>
                <Switch
                  checked={notificationSettings.confessions}
                  onCheckedChange={() => handleNotificationToggle("confessions")}
                />
              </div>

              <Button 
                className="w-full bg-primary-purple hover:bg-primary-purple/90"
                onClick={handleSaveNotifications}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your profile and interact with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Who can see your profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone at my university</SelectItem>
                    <SelectItem value="department">Only my department</SelectItem>
                    <SelectItem value="connections">Only my connections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Department</p>
                  <p className="text-sm text-gray-500">Display your department on your profile</p>
                </div>
                <Switch
                  checked={privacySettings.showDepartment}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showDepartment: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Interests</p>
                  <p className="text-sm text-gray-500">Display your interests on your profile</p>
                </div>
                <Switch
                  checked={privacySettings.showInterests}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showInterests: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="messagePermissions">Who can message you</Label>
                <Select
                  value={privacySettings.allowMessages}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, allowMessages: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Who can send you messages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone at my university</SelectItem>
                    <SelectItem value="department">Only my department</SelectItem>
                    <SelectItem value="connections">Only my connections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-primary-purple hover:bg-primary-purple/90"
                onClick={handleSavePrivacy}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
