/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { NetworkOnly, Serwist } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const apiBase = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://hallha.alef-team.com"
).replace(/\/$/, "")

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true,
  precacheOptions: {
    navigateFallback: "/~offline",
    navigateFallbackAllowlist: [/^\/(\?.*)?$/],
  },
  runtimeCaching: [
    {
      matcher: ({ sameOrigin, url: { pathname } }) =>
        sameOrigin &&
        (pathname.startsWith("/api/") ||
          pathname.startsWith("/dashboard") ||
          pathname === "/login" ||
          pathname.startsWith("/login/") ||
          pathname === "/register" ||
          pathname.startsWith("/register/")),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => {
        const normalized = url.href.endsWith("/")
          ? url.href.slice(0, -1)
          : url.href
        return normalized.startsWith(apiBase)
      },
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
})

serwist.addEventListeners()
