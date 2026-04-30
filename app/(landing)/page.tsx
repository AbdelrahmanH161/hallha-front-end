import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsBannerSection } from "@/components/landing/stats-banner"
import { AboutSection } from "@/components/landing/about-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { ContactSection } from "@/components/landing/contact-section"
import { FaqSection } from "@/components/landing/faq-section"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "landing.metadata" })
  const altLocale = locale === "ar" ? "en" : "ar"

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/",
      languages: {
        [locale]: "/",
        [altLocale]: "/",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale,
      alternateLocale: altLocale,
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og.png"],
    },
  }
}

export default async function LandingPage() {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <div dir={direction} className="min-h-svh bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Trust ticker strip */}
        <StatsBannerSection />

        {/* 3. About Us */}
        <AboutSection />

        {/* 4. Features */}
        <FeaturesSection />

        {/* 5. Pricing */}
        <PricingSection />

        {/* 7. FAQ */}
        <FaqSection />

        {/* 6. Contact */}
        <ContactSection />
      </main>

      <SiteFooter />
    </div>
  )
}
