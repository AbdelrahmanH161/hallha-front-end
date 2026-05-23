"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CommonCopy } from "@/components/auth/onboarding/onboarding-shared"
import { useSubmitFirstClientMutation } from "@/lib/api/queries/organization"

type Props = {
  common: CommonCopy
  backLabel: string
  continueLabel: string
  skipLabel: string
  onBack: () => void
  onSuccess: () => void
  onSkip: () => void
  isSkipping: boolean
}

export function FirstClientStep({
  common,
  backLabel,
  continueLabel,
  skipLabel,
  onBack,
  onSuccess,
  onSkip,
  isSkipping,
}: Props) {
  const [name, setName] = React.useState("")
  const [industry, setIndustry] = React.useState("")
  const mutation = useSubmitFirstClientMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await mutation.mutateAsync({
        name: name.trim(),
        industry: industry.trim() || undefined,
      })
      onSuccess()
    } catch (err) {
      toast.error(common.errors.unknown, {
        description: err instanceof Error ? err.message : common.errors.unknown,
      })
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Add your first audited client</h1>
        <p className="text-sm text-muted-foreground">
          You will run Sharia audits and store contracts under each client. You can
          add more later from the Clients page.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="first-client-name">Client name</Label>
          <Input
            id="first-client-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bank Alpha"
            autoFocus
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="first-client-industry">Industry (optional)</Label>
          <Input
            id="first-client-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Banking"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            {backLabel}
          </Button>
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={isSkipping}
            >
              {skipLabel}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="font-semibold"
            >
              {mutation.isPending ? "Saving…" : continueLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
