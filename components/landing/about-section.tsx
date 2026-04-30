import { getTranslations } from "next-intl/server"
import { Users, Target, Globe, Award } from "lucide-react"

import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

const stats = [
  { icon: Users, labelKey: "about.stat1Label", valueKey: "about.stat1Value" },
  { icon: Target, labelKey: "about.stat2Label", valueKey: "about.stat2Value" },
  { icon: Globe, labelKey: "about.stat3Label", valueKey: "about.stat3Value" },
  { icon: Award, labelKey: "about.stat4Label", valueKey: "about.stat4Value" },
]

export async function AboutSection() {
  const t = await getTranslations("landing")

  return (
    <section id="about" className="relative overflow-hidden py-5 lg:py-10">
      <IslamicPattern opacity={0.04} />

      {/* Ambient blob */}
      <div
        className="blob pointer-events-none absolute top-0 right-1/4 h-80 w-80 opacity-40"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section label */}
        <ScrollReveal className="mb-14 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest glass">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("about.sectionLabel")}
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {t("about.title")}{" "}
            <span className="gradient-text">{t("about.titleAccent")}</span>
          </h2>
        </ScrollReveal>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: mission text */}
          <ScrollReveal delay={100}>
            <LiquidGlassCard goldBorder className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                {/* Decorative Islamic star */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  className="text-accent flex-shrink-0"
                >
                  <polygon
                    points="18,2 21,13 32,13 23,20 26,31 18,24 10,31 13,20 4,13 15,13"
                    fill="currentColor"
                    fillOpacity="0.9"
                  />
                </svg>
                <h3 className="text-xl font-bold">{t("about.missionTitle")}</h3>
              </div>

              <p className="leading-relaxed text-muted-foreground">
                {t("about.missionBody")}
              </p>

              <div className="space-y-3">
                {["about.point1", "about.point2", "about.point3"].map((key) => (
                  <div key={key} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-sm text-foreground/85">{t(key as never)}</span>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          </ScrollReveal>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ icon: Icon, labelKey, valueKey }, i) => (
              <ScrollReveal key={labelKey} delay={150 + i * 80}>
                <LiquidGlassCard
                  tilt
                  className="group flex flex-col items-center gap-3 p-6 text-center hover:border-accent/40 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-black gradient-text-gold">
                    {t(valueKey as never)}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t(labelKey as never)}
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
