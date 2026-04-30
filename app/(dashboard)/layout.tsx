import type { ReactNode } from "react"

import { DashboardSidebar } from "@/components/dashboard/app-sidebar"
import { LocaleSwitch } from "@/components/locale-switch"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { DirectionProvider } from "@/components/ui/direction"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type DashboardLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params

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

            <header className="relative flex h-16 shrink-0 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-4" />
                <p className="text-sm font-medium text-muted-foreground">
                  Sharia Compliance Intelligence
                </p>
              </div>

              <div className="flex items-center gap-2">
                <LocaleSwitch />
                <ThemeToggle />
              </div>
            </header>

            <main className="relative mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
              <div className="rounded-2xl border bg-card/50 p-4 shadow-sm backdrop-blur md:p-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </DirectionProvider>
    </div>
  )
}
