"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { ChatProvider } from "@/contexts/chat-context"
import ClientProviders from "@/components/client-providers"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <ClientProviders>{children}</ClientProviders>
      </ChatProvider>
    </AuthProvider>
  )
} 