import { getTranslations } from "next-intl/server"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardOverviewPage() {
  const t = await getTranslations("app.overview")

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("pageDescription")}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("shariaMeter")}</CardTitle>
            <CardDescription>{t("shariaMeterDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                style={{ width: "67%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("alerts")}</CardTitle>
            <CardDescription>{t("alertsDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  )
}
