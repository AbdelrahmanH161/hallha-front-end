import {
  LayoutDashboardIcon,
  MessageSquareIcon,
  UsersIcon,
  BookOpenIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  /** i18n key under `app.nav` */
  key: "dashboard" | "chats" | "clients" | "knowledge"
  href: string
  icon: LucideIcon
  /** Match this prefix against pathname for active state. Defaults to `href`. */
  matchPrefix?: string
}

/**
 * Primary sidebar navigation. Order = display order.
 * Localized labels are looked up at render-time from `app.nav.<key>`.
 */
export const PRIMARY_NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { key: "chats", href: "/dashboard", icon: MessageSquareIcon, matchPrefix: "/chat" },
  { key: "clients", href: "/clients", icon: UsersIcon },
  { key: "knowledge", href: "/knowledge", icon: BookOpenIcon },
]
