"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, MessageSquare } from "lucide-react"

import {
  useClientDocumentsQuery,
  useClientQuery,
  useDeleteClientDocumentMutation,
  type ClientDocument,
} from "@/lib/api/queries/clients"
import type { ClientDocumentType } from "@/lib/types/retrieved-source"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DocumentUploader } from "@/components/clients/document-uploader"

const DOCUMENT_TYPE_ORDER: ClientDocumentType[] = [
  "policies",
  "contracts",
  "financials",
  "other",
]

export default function ClientDetailPage() {
  const params = useParams<{ clientId: string }>()
  const clientId = params.clientId
  const t = useTranslations("app.clientDetail")
  const docTypeT = useTranslations("app.clientDetail.upload.documentTypes")

  const { data: client, isLoading } = useClientQuery(clientId)
  const { data: documents } = useClientDocumentsQuery(clientId)
  const deleteMutation = useDeleteClientDocumentMutation(clientId)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (!client) {
    return <div className="p-6 text-sm">{t("notFound")}</div>
  }

  const grouped: Record<ClientDocumentType, ClientDocument[]> = {
    policies: [],
    contracts: [],
    financials: [],
    other: [],
  }
  for (const d of documents ?? []) grouped[d.documentType].push(d)
  const totalDocs = documents?.length ?? 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/clients" className="flex items-center gap-1">
                <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden />
                {t("back")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {client.industry ? (
              <Badge variant="secondary" className="font-normal">
                {client.industry}
              </Badge>
            ) : null}
            <span>{t("documentsCount", { count: totalDocs })}</span>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/clients/${clientId}/chat`}>
            <MessageSquare className="size-4" aria-hidden />
            {t("startChat")}
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_minmax(20rem,24rem)]">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("documents.sectionTitle")}
          </h2>
          {totalDocs === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              {t("documents.empty")}
            </Card>
          ) : (
            <div className="space-y-4">
              {DOCUMENT_TYPE_ORDER.map((dt) => {
                const docs = grouped[dt]
                if (docs.length === 0) return null
                return (
                  <div key={dt} className="space-y-2">
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                      {docTypeT(dt as never)}
                    </h3>
                    <ul className="divide-y rounded-md border bg-card">
                      {docs.map((d) => (
                        <DocumentRow
                          key={d.s3Key}
                          doc={d}
                          onDelete={() => {
                            if (window.confirm(t("documents.deleteConfirm"))) {
                              void deleteMutation.mutate(d.s3Key)
                            }
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 md:sticky md:top-6 md:self-start">
          <Card>
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-sm font-semibold">
                {t("upload.sectionTitle")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t("upload.sectionHint")}</p>
            </CardHeader>
            <CardContent>
              <DocumentUploader clientId={clientId} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function DocumentRow({
  doc,
  onDelete,
}: {
  doc: ClientDocument
  onDelete: () => void
}) {
  const t = useTranslations("app.clientDetail.documents")
  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="truncate text-sm font-medium" title={doc.displayName}>
          {doc.displayName}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
          <span aria-hidden>·</span>
          <span>{Math.max(1, Math.round(doc.sizeBytes / 1024))} KB</span>
          <StatusBadge status={doc.status} />
        </div>
        {doc.status === "failed" && doc.error ? (
          <p className="text-xs text-destructive">{doc.error}</p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive"
      >
        {t("delete")}
      </Button>
    </li>
  )
}

function StatusBadge({ status }: { status: ClientDocument["status"] }) {
  const t = useTranslations("app.clientDetail.documents")
  if (status === "ready") return null // default state, no badge clutter
  if (status === "pending") {
    return (
      <Badge variant="outline" className="font-normal text-amber-600 dark:text-amber-400">
        {t("processing")}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="font-normal text-destructive">
      {t("failed")}
    </Badge>
  )
}
