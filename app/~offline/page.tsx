import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"

export default async function OfflinePage() {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"
  const t = await getTranslations("pwa.offline")

  return (
    <div dir={direction} className="min-h-svh bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex max-w-lg flex-col items-center justify-center gap-6 px-6 pt-32 pb-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
        <Button asChild className="bg-primary shadow-sm shadow-primary/25">
          <Link href="/">{t("retry")}</Link>
        </Button>
      </main>

      <SiteFooter />
    </div>
  )
}
