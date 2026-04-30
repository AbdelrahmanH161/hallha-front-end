import { getTranslations } from "next-intl/server"

import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { PricingSectionClient } from "@/components/landing/pricing-client"

export async function PricingSection() {
  const t = await getTranslations("landing")
  const tiersRaw = t.raw("pricing.tiers") as Record<
    string,
    { title: string; price: string; yearlyPrice?: string; features: string[]; cta: string; highlightLabel?: string }
  >

  const tiers = [
    {
      ...tiersRaw.startup!,
      period: t("pricing.period"),
      variant: "outline" as const,
    },
    {
      ...tiersRaw.growth!,
      period: t("pricing.period"),
      variant: "primary" as const,
    },
    {
      ...tiersRaw.enterprise!,
      period: "",
      variant: "outline" as const,
    },
  ]

  return (
    <section id="pricing" className="relative overflow-hidden py-5 lg:py-10">
      <IslamicPattern opacity={0.04} />

      <div
        className="blob pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 h-96 w-96 opacity-40"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <PricingSectionClient
          tiers={tiers}
          sectionLabel={t("pricing.sectionLabel")}
          title={t("pricing.title")}
          monthlyToggle={t("pricing.monthly")}
          yearlyToggle={t("pricing.yearly")}
          savingsLabel={t("pricing.savings")}
        />
      </div>
    </section>
  )
}
