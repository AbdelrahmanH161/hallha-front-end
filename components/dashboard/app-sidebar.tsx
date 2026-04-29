"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboardIcon, MessageSquareTextIcon, ArrowLeftRightIcon } from "lucide-react"

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

const navItems = [
  {
    href: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    href: "dashboard/chat",
    label: "AI Auditor Chat",
    icon: MessageSquareTextIcon,
  },
  {
    href: "dashboard/transactions",
    label: "Transactions",
    icon: ArrowLeftRightIcon,
  },
] as const

export function DashboardSidebar({
  locale,
  className,
  side = "left",
}: {
  locale: string
  className?: string
  side?: React.ComponentProps<typeof Sidebar>["side"]
}) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" side={side} className={className}>
      <SidebarHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-card/50 px-2 py-2 backdrop-blur">
          <div className="grid min-w-0 gap-0.5">
            <div className="truncate text-sm font-semibold tracking-tight text-accent">
              Hallilha
            </div>
            <div className="truncate text-xs text-muted-foreground">
              Sharia Compliance
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
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const href = `/${locale}/${item.href}`
                const isActive =
                  pathname === href ||
                  (item.href !== "dashboard" && pathname.startsWith(`${href}/`))

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={href}>
                        <item.icon />
                        <span>{item.label}</span>
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

