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
