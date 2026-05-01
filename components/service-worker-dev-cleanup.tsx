"use client"

import * as React from "react"

/**
 * Serwist is disabled during `next dev`, but a service worker from a prior
 * `next build` / `next start` (or production) can keep controlling localhost.
 * It intercepts navigations (e.g. /register with NetworkOnly); when the dev
 * server drops the connection briefly, Workbox surfaces "no-response" and
 * Chrome shows ERR_FAILED. Unregister once in development to avoid that.
 */
export function ServiceWorkerDevCleanup() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    let cancelled = false

    void (async () => {
      const regs = await navigator.serviceWorker.getRegistrations()
      if (cancelled || regs.length === 0) return

      await Promise.all(regs.map((r) => r.unregister()))

      if (cancelled) return
      window.location.reload()
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
