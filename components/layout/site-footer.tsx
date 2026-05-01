import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Globe, Mail, ShieldCheck, ExternalLink } from "lucide-react"
import Image from "next/image"

export async function SiteFooter() {
  const t = await getTranslations("landing")

  const productLinks = [
    { href: "#features", label: t("nav.features") },
    { href: "#pricing", label: t("nav.pricing") },
    { href: "/register", label: t("footer.getStarted") },
    { href: "/login", label: t("nav.login") },
  ]

  const companyLinks = [
    { href: "#about", label: t("nav.about") },
    { href: "#faq", label: t("nav.faq") },
    { href: "#contact", label: t("nav.contact") },
  ]

  const socials = [
    { href: "#", label: "X / Twitter", icon: Globe },
    { href: "#", label: "LinkedIn", icon: ExternalLink },
    { href: "#", label: "GitHub", icon: Globe },
    { href: "#", label: "Email", icon: Mail },
  ]

  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{ borderColor: "var(--glass-border)" }}
    >
      {/* Subtle Islamic pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23064e3b' fill-rule='evenodd'%3E%3Cpolygon points='30,3 34,14 45,14 37,21 40,32 30,25 20,32 23,21 15,14 26,14'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-5">
            <div>
              <Image
                src="/logo.png"
                alt="Hallha"
                width={90}
                height={90}
                className="h-14 w-14"
              />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("footer.tagline")}
              </p>
            </div>

            {/* Compliance badge */}
            <div className="glass inline-flex items-center gap-2 rounded-xl px-3.5 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {t("footer.complianceBadge")}
              </span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="glass flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-foreground/70 uppercase">
              {t("footer.productTitle")}
            </h3>
            <ul className="space-y-2.5">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-foreground/70 uppercase">
              {t("footer.companyTitle")}
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / contact CTA */}
          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-foreground/70 uppercase">
              {t("footer.stayUpdated")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("footer.newsletterDesc")}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Mail className="h-3.5 w-3.5" />
              {t("footer.contactUs")}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground sm:flex-row"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <span>{t("footer.copyright")}</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition-colors hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
