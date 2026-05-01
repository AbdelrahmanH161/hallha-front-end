import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { ChatShell } from "@/components/chat/chat-shell"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const altLocale = locale === "ar" ? "en" : "ar"
  const t = await getTranslations({ locale, namespace: "app.chat.metadata" })

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/dashboard",
      languages: {
        [locale]: "/dashboard",
        [altLocale]: "/dashboard",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale,
      alternateLocale: altLocale,
      url: "/dashboard",
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og.png"],
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function DashboardChatPage() {
  return <ChatShell />
}
