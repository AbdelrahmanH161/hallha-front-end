import type { Metadata, Viewport } from "next"
import { Almarai, Montserrat } from "next/font/google"
import { getLocale } from "next-intl/server"

import "./globals.css"
import { Providers } from "./providers"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { NextIntlClientProvider } from "next-intl"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
})

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-arabic",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#064e3b" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hallha",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "any" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        locale === "ar" ? "font-ar" : "font-sans",
        montserrat.variable,
        almarai.variable
      )}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Providers>{children}</Providers>
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
