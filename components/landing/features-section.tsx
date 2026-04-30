import { getTranslations } from "next-intl/server"
import { MessageSquare, Droplets, FileText, Calculator, Zap, Lock } from "lucide-react"

import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { LiquidGlassCard } from "@/components/landing/liquid-glass-card"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export async function FeaturesSection() {
  const t = await getTranslations("landing")

  return (
    <section id="features" className="relative overflow-hidden py-5 lg:py-10">
      <IslamicPattern opacity={0.045} />

      <div
        className="blob pointer-events-none absolute bottom-0 left-0 h-96 w-96 opacity-30"
        style={{ background: "radial-gradient(circle, rgba(6,78,59,0.25) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollReveal className="mb-16 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest glass">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t("features.sectionLabel")}
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            {t("features.description")}
          </p>
        </ScrollReveal>

        {/* Bento grid */}
        <div className="bento-grid">
          {/* Cell 1 — large (span 2) */}
          <ScrollReveal delay={0} className="bento-span-2">
            <BentoCell
              icon={<MessageSquare className="h-6 w-6" />}
              title={t("features.items.auditor.title")}
              description={t("features.items.auditor.description")}
              accent
              large
              emoji="🤖"
            />
          </ScrollReveal>

          {/* Cell 2 */}
          <ScrollReveal delay={80}>
            <BentoCell
              icon={<Droplets className="h-6 w-6" />}
              title={t("features.items.purification.title")}
              description={t("features.items.purification.description")}
              emoji="💧"
            />
          </ScrollReveal>

          {/* Cell 3 */}
          <ScrollReveal delay={160}>
            <BentoCell
              icon={<FileText className="h-6 w-6" />}
              title={t("features.items.contracts.title")}
              description={t("features.items.contracts.description")}
              emoji="📜"
            />
          </ScrollReveal>

          {/* Cell 4 */}
          <ScrollReveal delay={240}>
            <BentoCell
              icon={<Calculator className="h-6 w-6" />}
              title={t("features.items.zakat.title")}
              description={t("features.items.zakat.description")}
              emoji="🕌"
            />
          </ScrollReveal>

          {/* Cell 5 — large bottom */}
          <ScrollReveal delay={300} className="bento-span-2">
            <BentoCell
              icon={<Zap className="h-6 w-6" />}
              title={t("features.items.realtime.title")}
              description={t("features.items.realtime.description")}
              large
              emoji="⚡"
            />
          </ScrollReveal>

          {/* Cell 6 */}
          <ScrollReveal delay={360}>
            <BentoCell
              icon={<Lock className="h-6 w-6" />}
              title={t("features.items.secure.title")}
              description={t("features.items.secure.description")}
              emoji="🔒"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

function BentoCell({
  icon,
  title,
  description,
  accent = false,
  large = false,
  emoji,
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent?: boolean
  large?: boolean
  emoji?: string
}) {
  return (
    <LiquidGlassCard
      tilt
      goldBorder={accent}
      className={`group relative h-full overflow-hidden p-5 sm:p-6 transition-shadow duration-300 hover:shadow-xl ${
        large ? "min-h-[170px] sm:min-h-[200px]" : "min-h-[150px] sm:min-h-[180px]"
      } ${accent ? "bg-primary/5 dark:bg-primary/10" : ""}`}
    >
      {/* Shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Emoji watermark */}
      {emoji && (
        <span className="pointer-events-none absolute -bottom-2 -right-2 text-7xl opacity-[0.07] select-none">
          {emoji}
        </span>
      )}

      <div className="relative z-10 flex h-full flex-col gap-3 sm:gap-4">
        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            accent
              ? "bg-accent/20 text-accent"
              : "bg-primary/10 text-primary dark:bg-primary/20"
          }`}
        >
          {icon}
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold leading-snug text-foreground sm:text-xl">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </LiquidGlassCard>
  )
}
