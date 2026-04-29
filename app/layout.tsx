import { Almarai, Montserrat } from "next/font/google"
import { cookies } from "next/headers"

import "./globals.css"
import { Providers } from "./providers"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { defaultLocale, getDirection, isLocale, type Locale } from "@/lib/i18n"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
})

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-arabic",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const localeCookie = (await cookies()).get("locale")?.value
  const locale: Locale = isLocale(localeCookie) ? localeCookie : defaultLocale
  const direction = getDirection(locale)

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
        <ThemeProvider>
          <TooltipProvider>
            <Providers>{children}</Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
