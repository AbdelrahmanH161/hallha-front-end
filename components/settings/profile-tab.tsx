"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { useOrganizationQuery } from "@/lib/api/queries/organization"
import { useSession } from "@/lib/auth/client"

function initials(name?: string | null, email?: string | null) {
  const source = name || email || ""
  return source.trim().charAt(0).toUpperCase() || "U"
}

export function ProfileTab() {
  const t = useTranslations("app.profile")
  const tUser = useTranslations("app.userMenu")
  const { data: session, isPending } = useSession()
  const { data: org } = useOrganizationQuery()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("signedInAs")}…
      </div>
    )
  }

  if (!session?.user) {
    return (
      <p className="py-8 text-sm text-muted-foreground">{t("noSession")}</p>
    )
  }

  const user = session.user
  const planLabel =
    org?.plan && org.plan !== "free"
      ? org.plan.charAt(0).toUpperCase() + org.plan.slice(1)
      : t("currentPlanNone")

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center gap-4">
        <Avatar className="size-14 border border-border bg-secondary">
          <AvatarFallback className="bg-secondary text-lg font-semibold">
            {initials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{user.name || tUser("guest")}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField label={t("name")} value={user.name ?? "—"} />
        <ReadOnlyField label={t("email")} value={user.email ?? "—"} />
        <ReadOnlyField label={t("currentPlan")} value={planLabel} />
        <ReadOnlyField label={t("role")} value={tUser("rolePro")} />
      </div>

      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        {t("managedByProvider")}
      </p>
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        {value}
      </div>
    </div>
  )
}
