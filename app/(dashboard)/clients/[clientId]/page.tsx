"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import {
  useClientDocumentsQuery,
  useClientQuery,
  useDeleteClientDocumentMutation,
  useUploadClientDocumentMutation,
} from "@/lib/api/queries/clients"
import type { ClientDocumentType } from "@/lib/types/retrieved-source"

const DOCUMENT_TYPES: { value: ClientDocumentType; label: string }[] = [
  { value: "policies", label: "Policies" },
  { value: "contracts", label: "Contracts" },
  { value: "financials", label: "Financials" },
  { value: "other", label: "Other" },
]

export default function ClientDetailPage() {
  const params = useParams<{ clientId: string }>()
  const clientId = params.clientId
  const qc = useQueryClient()

  const { data: client, isLoading } = useClientQuery(clientId)
  const { data: documents } = useClientDocumentsQuery(clientId)
  const uploadMutation = useUploadClientDocumentMutation(clientId, qc)
  const deleteMutation = useDeleteClientDocumentMutation(clientId)

  const fileRef = useRef<HTMLInputElement | null>(null)
  const [documentType, setDocumentType] = useState<ClientDocumentType>("contracts")
  const [progress, setProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploadError(null)
    setProgress(0)
    try {
      await uploadMutation.mutateAsync({
        file,
        documentType,
        onProgress: (loaded, total) => {
          setProgress(Math.round((loaded / total) * 100))
        },
      })
      setProgress(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (err) {
      setUploadError((err as Error).message)
      setProgress(null)
    }
  }

  if (isLoading) return <div className="p-6 text-sm">Loading…</div>
  if (!client) return <div className="p-6 text-sm">Client not found.</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-sm text-muted-foreground">
            {client.industry ?? "—"} · {client.documentCount} documents
          </p>
        </div>
        <Link
          href={`/clients/${clientId}/chat`}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Start chat about this client
        </Link>
      </header>

      <section className="rounded-md border p-4 space-y-3">
        <h2 className="text-sm font-medium">Upload a document</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_TYPES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setDocumentType(dt.value)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  documentType === dt.value
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" className="text-sm" required />
          <button
            type="submit"
            disabled={uploadMutation.isPending || progress !== null}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {progress !== null ? `Uploading… ${progress}%` : "Upload"}
          </button>
          {uploadError ? (
            <div className="text-sm text-destructive">{uploadError}</div>
          ) : null}
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Documents</h2>
        {DOCUMENT_TYPES.map((dt) => {
          const docs = documents?.filter((d) => d.documentType === dt.value) ?? []
          if (docs.length === 0) return null
          return (
            <div key={dt.value} className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                {dt.label}
              </h3>
              <ul className="divide-y rounded-md border">
                {docs.map((d) => (
                  <li key={d.s3Key} className="flex items-center justify-between p-3">
                    <div>
                      <div className="text-sm">{d.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(d.uploadedAt).toLocaleString()} · {Math.round(d.sizeBytes / 1024)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Delete this document and its vectors?")) {
                          void deleteMutation.mutate(d.s3Key)
                        }
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {(documents?.length ?? 0) === 0 ? (
          <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
            No documents uploaded yet for this client.
          </div>
        ) : null}
      </section>
    </div>
  )
}
