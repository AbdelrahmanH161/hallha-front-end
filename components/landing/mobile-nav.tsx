"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface MobileNavProps {
  links: { href: string; label: string }[]
  loginLabel: string
  loginHref: string
  registerLabel: string
}

export function MobileNav({ links, loginLabel, loginHref, registerLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-xl glass md:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-x-4 top-20 z-50 rounded-2xl glass-strong p-5 transition-all duration-300 md:hidden ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-1 mb-5">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--glass-border)" }}>
          <Button variant="outline" asChild className="glass border-0">
            <Link href={loginHref} onClick={() => setOpen(false)}>{loginLabel}</Link>
          </Button>
          <Button asChild className="bg-primary">
            <Link href="/register" onClick={() => setOpen(false)}>{registerLabel}</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
