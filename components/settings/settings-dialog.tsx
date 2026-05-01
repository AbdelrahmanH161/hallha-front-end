"use client"

import { useTranslations } from "next-intl"

import { OrganizationTab } from "@/components/settings/organization-tab"
import { PreferencesTab } from "@/components/settings/preferences-tab"
import { ProfileTab } from "@/components/settings/profile-tab"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"

export function SettingsDialog() {
  const t = useTranslations("app.settings")
  const open = useSettingsDialog((s) => s.open)
  const tab = useSettingsDialog((s) => s.tab)
  const setOpen = useSettingsDialog((s) => s.setOpen)
  const setTab = useSettingsDialog((s) => s.setTab)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
            <TabsTrigger value="organization">{t("tabs.organization")}</TabsTrigger>
            <TabsTrigger value="preferences">{t("tabs.preferences")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="organization">
            <OrganizationTab />
          </TabsContent>
          <TabsContent value="preferences">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
