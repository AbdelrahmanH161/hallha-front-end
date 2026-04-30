"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function ChatSuggestionChip({
  icon,
  label,
  sub,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "glass-card group flex flex-col items-start gap-1 rounded-xl p-4 text-start transition-all",
        "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_6px_20px_rgba(6,78,59,0.12)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      <div className="text-xl leading-none">{icon}</div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  )
}
