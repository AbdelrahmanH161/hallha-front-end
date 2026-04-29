import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

const baseURL =
  process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:8000"

export const authClient = createAuthClient({
  baseURL,
  plugins: [organizationClient()],
})

export const { useSession, signIn, signUp, signOut } = authClient
