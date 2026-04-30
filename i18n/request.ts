import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export default getRequestConfig(async () => {
  // Try to get locale from cookie, fallback to "ar"
  const cookieStore = cookies()
  const locale = (await cookieStore).get("locale")?.value || "ar"

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
