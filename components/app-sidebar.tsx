"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { GalleryVerticalEndIcon } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { PRIMARY_NAV } from "@/lib/nav"

const placeholderTeams = [
  {
    name: "Workspace",
    logo: <GalleryVerticalEndIcon />,
    plan: "",
  },
]
const placeholderUser = {
  name: "Account",
  email: "",
  avatar: "",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navT = useTranslations("app.nav")
  const pathname = usePathname() ?? ""

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={placeholderTeams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{navT("platform")}</SidebarGroupLabel>
          <SidebarMenu>
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon
              const prefix = item.matchPrefix ?? item.href
              const isActive =
                pathname === item.href ||
                (prefix !== "/" && pathname.startsWith(prefix))
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    tooltip={navT(item.key)}
                    isActive={isActive}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{navT(item.key)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:hidden">
          <ThemeToggle />
        </div>
        <NavUser user={placeholderUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
