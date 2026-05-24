"use client"

import type { QueryClient } from "@tanstack/react-query"

import { signOut } from "@/lib/auth/client"
import { useRegisterDraft } from "@/lib/stores/register-draft"

/** Clear client auth state so logged-out users can register again. */
export async function performSignOut(queryClient: QueryClient) {
  await signOut()
  queryClient.clear()
  useRegisterDraft.getState().reset()
}
