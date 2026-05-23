"use client"

import { useParams } from "next/navigation"

import { ChatShell } from "@/components/chat/chat-shell"

export default function ClientChatPage() {
  const params = useParams<{ clientId: string }>()
  return <ChatShell clientId={params.clientId} />
}
