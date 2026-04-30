import { getTranslations } from "next-intl/server"

export async function SiteFooter() {
  const t = await getTranslations("landing")

  return (
    <footer className="border-t bg-muted/20 py-12">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
        {t("footer")}
      </div>
    </footer>
  )
}
