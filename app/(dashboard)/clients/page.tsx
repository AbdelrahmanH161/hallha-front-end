"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight, Building2, Plus, Users } from "lucide-react"

import {
  useClientsQuery,
  useCreateClientMutation,
} from "@/lib/api/queries/clients"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ClientsPage() {
  const t = useTranslations("app.clients")
  const { data, isLoading } = useClientsQuery()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="size-4" aria-hidden />
          {t("newClient")}
        </Button>
      </header>

      {isLoading ? (
        <ClientGridSkeleton />
      ) : data?.items.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((c) => (
            <Card
              key={c.id}
              className="group flex flex-col transition-colors hover:border-primary/40"
            >
              <CardHeader className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold">
                    <Link
                      href={`/clients/${c.id}`}
                      className="hover:underline focus-visible:underline focus-visible:outline-none"
                    >
                      {c.name}
                    </Link>
                  </CardTitle>
                  <Building2
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {c.industry ? (
                    <Badge variant="secondary" className="font-normal">
                      {c.industry}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                      {t("noIndustry")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {t("documentsCount", { count: c.documentCount })}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="gap-1 px-2">
                  <Link href={`/clients/${c.id}`}>
                    {t("open")}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateClientDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  )
}

function ClientGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="space-y-3 p-6">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations("app.clients")
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Users className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{t("empty")}</p>
        <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
      </div>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="size-4" aria-hidden />
        {t("emptyCta")}
      </Button>
    </Card>
  )
}

function CreateClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("app.clients.dialog")
  const create = useCreateClientMutation()
  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({
      name: name.trim(),
      industry: industry.trim() || undefined,
    })
    setName("")
    setIndustry("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription className="sr-only">{t("title")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="client-name">{t("nameLabel")}</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-industry">{t("industryLabel")}</Label>
            <Input
              id="client-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder={t("industryPlaceholder")}
            />
          </div>
          {create.error ? (
            <p className="text-sm text-destructive">
              {(create.error as Error).message}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
