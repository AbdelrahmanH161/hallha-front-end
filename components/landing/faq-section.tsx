import { getTranslations } from "next-intl/server"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { FaqClient } from "@/components/landing/faq-client"

export async function FaqSection() {
  const t = await getTranslations("landing")
  const items = t.raw("faq.items") as { q: string; a: string }[]

  return (
    <section id="faq" className="relative overflow-hidden py-5 lg:py-10">
      <IslamicPattern opacity={0.04} />

      <div
        className="blob pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 opacity-35"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-4xl px-6">
        <FaqClient
          sectionLabel={t("faq.sectionLabel")}
          title={t("faq.title")}
          titleAccent={t("faq.titleAccent")}
          items={items}
        />
      </div>
    </section>
  )
}
