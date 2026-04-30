import { LoginForm } from "@/components/auth/login-form"
import { getLocale } from "next-intl/server"

export default async function LoginPage() {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <div dir={direction}>
      <LoginForm />
    </div>
  )
}
