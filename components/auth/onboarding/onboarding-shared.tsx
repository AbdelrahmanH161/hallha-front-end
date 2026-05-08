"use client"

import { Loader2 } from "lucide-react"

import { ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/button"

export type CommonCopy = {
  errors: Record<string, string>
  toast: Record<string, string>
}

export function resolveErrorKey(
  key: string | undefined,
  common: CommonCopy
): string | undefined {
  if (!key) return undefined
  const errors = common.errors as Record<string, string>
  return errors[key] ?? key
}

export function describeError(err: unknown, common: CommonCopy): string {
  if (err instanceof ApiError) return err.detail
  if (err instanceof Error) return err.message
  return common.errors.unknown
}

export function OnboardingHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function FooterNav({
  backLabel,
  nextLabel,
  skipLabel,
  onBack,
  onSkip,
  isSubmitting,
  isSkipping,
}: {
  backLabel: string
  nextLabel: string
  skipLabel?: string
  onBack: () => void
  onSkip?: () => void
  isSubmitting: boolean
  isSkipping?: boolean
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
      <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting || isSkipping}>
        {backLabel}
      </Button>
      <div className="flex items-center gap-2">
        {onSkip && skipLabel ?
          <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting || isSkipping}>
            {isSkipping ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {skipLabel}
          </Button>
        : null}
        <Button type="submit" className="font-semibold" disabled={isSubmitting || isSkipping}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
