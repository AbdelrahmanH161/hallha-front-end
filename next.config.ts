import type { NextConfig } from "next"
import { randomUUID } from "node:crypto"
import withSerwistInit from "@serwist/next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {}

const withNextIntl = createNextIntlPlugin()

const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? randomUUID()

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
})

export default withSerwist(withNextIntl(nextConfig))
