import { LocaleSwitch } from "@/components/locale-switch"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs"
import { UserMenu } from "@/components/layout/user-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="relative flex h-16 shrink-0 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="h-4" />
        <AppBreadcrumbs />
      </div>

      <div className="flex items-center gap-1.5">
        <LocaleSwitch variant="ghost" />
        <ThemeToggle />
        <Separator orientation="vertical" className="h-4 mx-1" />
        {/* <UserMenu /> */}
      </div>
    </header>
  )
}
