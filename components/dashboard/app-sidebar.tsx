"use client"

import { useLocale, useTranslations } from "next-intl"
import {
  ArrowLeftRightIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  labelKey: "chat" | "overview" | "transactions"
  icon: LucideIcon
  exact?: boolean
}

const navItems: readonly NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "chat",
    icon: MessageSquareTextIcon,
    exact: true,
  },
  {
    href: "/dashboard/overview",
    labelKey: "overview",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/dashboard/transactions",
    labelKey: "transactions",
    icon: ArrowLeftRightIcon,
  },
]

export function DashboardSidebar({
  className,
  side = "left",
}: {
  className?: string
  side?: React.ComponentProps<typeof Sidebar>["side"]
}) {
  const pathname = usePathname()
  const locale = useLocale()
  const tNav = useTranslations("app.nav")
  const tSidebar = useTranslations("app.sidebar")

  return (
    <Sidebar collapsible="icon" side={side} className={className}>
      <SidebarHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-card/50 px-2 py-2 backdrop-blur">
          <div className="grid min-w-0 gap-0.5">
            <div className="truncate text-sm font-semibold tracking-tight text-accent">
              {tSidebar("brand")}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {tSidebar("tagline")}
            </div>
          </div>
          <div className="rounded-md border bg-background/60 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            {locale.toUpperCase()}
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{tSidebar("workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const label = tNav(item.labelKey)
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={cn(
                        "data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
