import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { defaultLocale, isLocale } from "@/lib/i18n"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split("/").filter(Boolean)
  const pathLocale = segments[0]
  if (isLocale(pathLocale)) {
    const isDashboardRoute = segments[1] === "dashboard"
    const hasSession = request.cookies.has("hallha.session_token")

    if (isDashboardRoute && !hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = `/${pathLocale}/login`
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }

    const response = NextResponse.next()
    response.cookies.set("locale", pathLocale)
    return response
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
