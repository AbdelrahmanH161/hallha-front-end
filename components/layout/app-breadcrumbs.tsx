"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "chat",
  "/dashboard/overview": "overview",
  "/dashboard/transactions": "transactions",
}

export function AppBreadcrumbs() {
  const pathname = usePathname()
  const tNav = useTranslations("app.nav")
  const tSidebar = useTranslations("app.sidebar")

  const segments = pathname.split("/").filter(Boolean)
  const trail: { href: string; label: string }[] = []

  segments.reduce((acc, segment) => {
    const href = `${acc}/${segment}`
    const labelKey = ROUTE_LABELS[href]
    if (labelKey) {
      trail.push({ href, label: tNav(labelKey) })
    }
    return href
  }, "")

  if (trail.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">{tSidebar("workspace")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {trail.map((crumb, idx) => {
          const isLast = idx === trail.length - 1
          return (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator className="rtl:rotate-180" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
