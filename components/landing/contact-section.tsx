import { getTranslations } from "next-intl/server"
import { IslamicPattern } from "@/components/landing/islamic-pattern"
import { ContactSectionClient } from "@/components/landing/contact-client"

export async function ContactSection() {
  const t = await getTranslations("landing")

  return (
    <section id="contact" className="relative overflow-hidden py-5 lg:py-10">
      <IslamicPattern opacity={0.04} />

      <div
        className="blob pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 opacity-30"
        style={{ background: "radial-gradient(circle, rgba(6,78,59,0.20) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <ContactSectionClient
          sectionLabel={t("contact.sectionLabel")}
          title={t("contact.title")}
          titleAccent={t("contact.titleAccent")}
          subtitle={t("contact.subtitle")}
          nameLabel={t("contact.nameLabel")}
          namePlaceholder={t("contact.namePlaceholder")}
          emailLabel={t("contact.emailLabel")}
          emailPlaceholder={t("contact.emailPlaceholder")}
          messageLabel={t("contact.messageLabel")}
          messagePlaceholder={t("contact.messagePlaceholder")}
          submitLabel={t("contact.submit")}
          successMessage={t("contact.success")}
        />
      </div>
    </section>
  )
}
