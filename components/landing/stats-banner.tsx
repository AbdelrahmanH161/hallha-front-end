import { getTranslations } from "next-intl/server"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { StatsTicker } from "@/components/landing/stats-ticker"

export async function StatsBannerSection() {
  const t = await getTranslations("landing")
  const items = t.raw("stats.items") as string[]

  return (
    <section className="relative overflow-hidden border-y py-0" style={{ borderColor: "var(--glass-border)" }}>
      <IslamicPattern opacity={0.025} />
      <div className="relative">
        <StatsTicker items={items} />
      </div>
    </section>
  )
}
