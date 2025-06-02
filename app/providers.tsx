"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { ChatProvider } from "@/contexts/chat-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </NotificationsProvider>
    </AuthProvider>
  )
} 