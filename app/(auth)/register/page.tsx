import { RegisterWizard } from "@/components/auth/onboarding/register-wizard"
import { getLocale } from "next-intl/server"

export default async function RegisterPage() {
  const locale = await getLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <div dir={direction}>
      <RegisterWizard />
    </div>
  )
}
