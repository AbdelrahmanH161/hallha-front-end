"use client"

import * as React from "react"
import { ArrowRight, Building2, CreditCard, Landmark, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { useOrganizationQuery } from "@/lib/api/queries/organization"
import { useSettingsDialog } from "@/lib/stores/settings-dialog"
import { cn } from "@/lib/utils"

const DISMISS_KEY = "hallha-onboarding-banner-dismissed-at"
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000

type StepStatus = {
  key: "company" | "bank" | "plan"
  done: boolean
  Icon: typeof Building2
  labelKey: "company" | "bank" | "plan"
}

export function OnboardingBanner() {
  const t = useTranslations("app.onboardingBanner")
  const openSettings = useSettingsDialog((s) => s.openAt)
  const [dismissed, setDismissed] = React.useState(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(DISMISS_KEY) : null
    const dismissedAt = raw ? Number(raw) : 0
    return Date.now() - dismissedAt < DISMISS_TTL_MS
  })
  const { data: org } = useOrganizationQuery()

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  if (!org || org.onboardingCompleted || dismissed) return null

  const steps: StepStatus[] = [
    {
      key: "company",
      done: Boolean(org.legalName && org.industry),
      Icon: Building2,
      labelKey: "company",
    },
    {
      key: "bank",
      done: Boolean(org.bankInstitutionId),
      Icon: Landmark,
      labelKey: "bank",
    },
    {
      key: "plan",
      done: Boolean(org.plan && org.plan !== "free"),
      Icon: CreditCard,
      labelKey: "plan",
    },
  ]
  const remaining = steps.filter((s) => !s.done).length
  if (remaining === 0) return null

  return (
    <div className="relative mb-3 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("dismiss")}
        className="absolute inset-e-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>

      <div className="flex flex-col gap-3 pe-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {t("title", { count: remaining })}
          </h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs">
            {steps.map((s) => (
              <li
                key={s.key}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                  s.done
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                <s.Icon className="size-3.5" aria-hidden />
                {t(`steps.${s.labelKey}`)}
                {s.done ? <span aria-hidden>✓</span> : null}
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="button"
          onClick={() => openSettings("organization")}
          className="self-start sm:self-center"
        >
          {t("cta")}
          <ArrowRight className="ms-1 size-4 rtl:rotate-180" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
