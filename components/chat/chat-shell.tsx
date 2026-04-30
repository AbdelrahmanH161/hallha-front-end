"use client"

import * as React from "react"

import { ChatHeader } from "@/components/chat/chat-header"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"
import { IslamicPattern } from "@/components/landing/islamic-pattern"

export function ChatShell() {
  return (
    <div className="relative flex h-svh w-full overflow-hidden bg-background">
      {/* Background mesh + Islamic pattern + floating blobs */}
      <div className="mesh-bg pointer-events-none absolute inset-0" />
      <IslamicPattern opacity={0.028} className="z-0 text-primary" />
      <div className="animate-pulse-glow blob pointer-events-none absolute -left-20 -top-20 size-[400px] bg-[radial-gradient(circle,rgba(6,78,59,0.14)_0%,transparent_70%)]" />
      <div className="blob pointer-events-none absolute -bottom-16 -right-16 size-[360px] bg-[radial-gradient(circle,rgba(212,175,55,0.10)_0%,transparent_70%)]" />

      <ChatSidebar />

      <main className="relative z-[1] flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3 sm:px-6 sm:pt-4">
            <OnboardingBanner />
          </div>
          <ChatWindow />
        </div>
      </main>
    </div>
  )
}
