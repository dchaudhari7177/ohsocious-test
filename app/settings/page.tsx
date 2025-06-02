"use client"

import { useState } from "react"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [password, setPassword] = useState("")

  const [formData, setFormData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: user?.email || "",
    department: userData?.department || "",
    year: userData?.year || "",
    bio: userData?.bio || "",
    location: userData?.location || "",
    notifications: {
      email: true,
      push: true,
      mentions: true,
      messages: true,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      allowMessages: true,
    },
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }))
  }

  const handlePrivacyChange = (key: string, value: boolean | string) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setLoading(true)
      await updateDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        year: formData.year,
        bio: formData.bio,
        location: formData.location,
        notifications: formData.notifications,
        privacy: formData.privacy,
        updatedAt: new Date(),
      })

      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !password) return

    try {
      setLoading(true)

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)

      // Delete user data
      await deleteDoc(doc(db, "users", user.uid))

      // Delete user account
      await deleteUser(user)

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please check your password and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
      setPassword("")
    }
  }

  if (!user || !userData) return null

  return (
    <Container>
      <div className="py-6 md:py-8">
        <PageHeader
          title="Settings"
          description="Manage your account settings and preferences"
        />

        <div className="mt-6 space-y-6">
          {/* Profile Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Profile Settings</h2>
            <p className="text-sm text-gray-500">
              Update your personal information and profile details
            </p>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Notification Settings</h2>
            <p className="text-sm text-gray-500">
              Choose how you want to be notified about activity
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.push}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("push", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mentions</Label>
                  <p className="text-sm text-gray-500">
                    Notify when someone mentions you
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.mentions}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("mentions", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-gray-500">
                    Notify when you receive a message
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.messages}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("messages", checked)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Privacy Settings</h2>
            <p className="text-sm text-gray-500">
              Control your privacy and security preferences
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Email</Label>
                  <p className="text-sm text-gray-500">
                    Allow others to see your email address
                  </p>
                </div>
                <Switch
                  checked={formData.privacy.showEmail}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showEmail", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-gray-500">
                    Let others send you direct messages
                  </p>
                </div>
                <Switch
                  checked={formData.privacy.allowMessages}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("allowMessages", checked)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Save Changes */}
          <div className="flex items-center justify-between">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="password">
                      Please enter your password to confirm:
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!password || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Container>
  )
}
