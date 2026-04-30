import type { ReactNode } from "react"
import { getLocale } from "next-intl/server"

import { DashboardSidebar } from "@/components/dashboard/app-sidebar"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"
import { AppHeader } from "@/components/layout/app-header"
import { DirectionProvider } from "@/components/ui/direction"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type DashboardLayoutProps = {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"
  const sidebarSide = direction === "rtl" ? "right" : "left"

  return (
    <div className="min-h-svh bg-background text-foreground">
      <DirectionProvider dir={direction} direction={direction}>
        <SidebarProvider>
          <DashboardSidebar side={sidebarSide} />
          <SidebarInset className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-1/3 left-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.35) 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              />
            </div>

            <AppHeader />

            <main className="relative mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col p-4 md:p-6">
              <OnboardingBanner />
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-card/50 p-4 shadow-sm backdrop-blur md:p-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </DirectionProvider>
    </div>
  )
}
