import type { ReactNode } from "react"
import { getLocale } from "next-intl/server"

import { SettingsDialog } from "@/components/settings/settings-dialog"
import { DirectionProvider } from "@/components/ui/direction"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <DirectionProvider dir={direction} direction={direction}>
      {children}
      <SettingsDialog />
    </DirectionProvider>
  )
}
