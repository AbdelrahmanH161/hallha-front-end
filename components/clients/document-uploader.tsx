"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useDropzone, type FileRejection } from "react-dropzone"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  AlertCircle,
  FileText,
  RotateCw,
  UploadCloud,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  clientKeys,
  uploadClientDocument,
  type ClientDocument,
} from "@/lib/api/queries/clients"
import type { ClientDocumentType } from "@/lib/types/retrieved-source"

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

// Queue only tracks the *transport* phase. Once the backend acknowledges (202),
// the file is hoisted into the documents list (left side) and the queue row is
// removed. Background ingest (pending → ready/failed) is reflected on the
// documents list itself via auto-polling in `useClientDocumentsQuery`.
type QueueState =
  | { phase: "queued" }
  | { phase: "uploading"; percent: number; cancel: () => void }
  | { phase: "failed"; error: string }

type QueueItem = {
  id: string
  file: File
  documentType: ClientDocumentType
  state: QueueState
}

const DOC_TYPES: ClientDocumentType[] = ["policies", "contracts", "financials", "other"]

export function DocumentUploader({ clientId }: { clientId: string }) {
  const t = useTranslations("app.clientDetail.upload")
  const qc = useQueryClient()
  const [documentType, setDocumentType] = useState<ClientDocumentType>("contracts")
  const [queue, setQueue] = useState<QueueItem[]>([])
  const isProcessingRef = useRef(false)

  const updateItem = useCallback(
    (id: string, patch: Partial<QueueItem> | ((it: QueueItem) => QueueItem)) => {
      setQueue((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it
          return typeof patch === "function" ? patch(it) : { ...it, ...patch }
        })
      )
    },
    []
  )

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((it) => it.id !== id))
  }, [])

  // Serial uploader: walk the queue, kick off the next 'queued' item once nothing is uploading.
  useEffect(() => {
    if (isProcessingRef.current) return
    const next = queue.find((it) => it.state.phase === "queued")
    if (!next) return

    isProcessingRef.current = true
    let cancelled = false

    const doUpload = async () => {
      let cancelFn: (() => void) | null = null
      updateItem(next.id, {
        state: {
          phase: "uploading",
          percent: 0,
          cancel: () => cancelFn?.(),
        },
      })

      try {
        const res = await uploadClientDocument({
          clientId,
          documentType: next.documentType,
          file: next.file,
          onProgress: (loaded, total) => {
            const percent = total > 0 ? Math.round((loaded / total) * 100) : 0
            updateItem(next.id, (it) =>
              it.state.phase === "uploading"
                ? { ...it, state: { ...it.state, percent } }
                : it
            )
          },
          registerAbort: (abort) => {
            cancelFn = abort
          },
        })
        if (cancelled) return

        // Optimistically hoist the new doc into the documents list. The list's
        // auto-poll flips status from pending → ready/failed without any
        // per-file polling on this side.
        const optimistic: ClientDocument = {
          s3Key: res.documentId,
          organizationId: "",
          clientId,
          documentType: next.documentType,
          originalName: res.document.originalName,
          displayName: res.document.displayName,
          uploadedAt: new Date().toISOString(),
          uploadedBy: "",
          sizeBytes: next.file.size,
          status: "pending",
          error: null,
          chunkCount: null,
          processedAt: null,
        }
        qc.setQueryData<ClientDocument[]>(
          clientKeys.documents(clientId),
          (prev) => {
            if (!prev) return [optimistic]
            if (prev.some((d) => d.s3Key === optimistic.s3Key)) return prev
            return [optimistic, ...prev]
          }
        )
        // Also nudge any list filtered by documentType (in case other callers
        // are subscribed to a typed view of the same client).
        qc.invalidateQueries({ queryKey: clientKeys.documents(clientId) })

        // Drop the queue row — the documents list now owns its lifecycle.
        removeItem(next.id)
        toast.success(t("uploadSuccessTitle"), {
          description: t("uploadSuccessDescription"),
        })
      } catch (err) {
        if (cancelled) return
        const isAbort = err instanceof DOMException && err.name === "AbortError"
        if (isAbort) {
          removeItem(next.id)
        } else {
          const message = err instanceof Error ? err.message : t("uploadFailed")
          updateItem(next.id, { state: { phase: "failed", error: message } })
          toast.error(t("uploadFailed"), { description: message })
        }
      } finally {
        isProcessingRef.current = false
        // Re-run effect to pick up the next queued item.
        setQueue((prev) => [...prev])
      }
    }

    void doUpload()

    return () => {
      cancelled = true
    }
  }, [queue, clientId, qc, removeItem, t, updateItem])

  const handleAccepted = useCallback(
    (files: File[]) => {
      if (files.length === 0) return
      const fresh: QueueItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        documentType,
        state: { phase: "queued" },
      }))
      setQueue((prev) => [...prev, ...fresh])
    },
    [documentType]
  )

  const handleRejected = useCallback(
    (rejections: FileRejection[]) => {
      for (const r of rejections) {
        const code = r.errors[0]?.code
        if (code === "file-too-large") {
          toast.error(t("tooLargeTitle"), { description: t("tooLargeDescription") })
        } else {
          toast.error(t("wrongTypeTitle"), { description: t("wrongTypeDescription") })
        }
      }
    },
    [t]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDropAccepted: handleAccepted,
    onDropRejected: handleRejected,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("documentTypeLabel")}
        </Label>
        <Tabs
          value={documentType}
          onValueChange={(v) => setDocumentType(v as ClientDocumentType)}
        >
          <TabsList className="grid w-full grid-cols-4">
            {DOC_TYPES.map((dt) => (
              <TabsTrigger key={dt} value={dt} className="text-xs">
                {t(`documentTypes.${dt}` as never)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div
        {...getRootProps({
          className: cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-muted/40",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
          ),
        })}
      >
        <input {...getInputProps()} />
        <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="size-5" aria-hidden />
        </div>
        <p className="text-sm font-medium">
          {isDragActive ? t("dropzone.active") : t("dropzone.idle")}
        </p>
        <p className="text-xs text-muted-foreground">{t("dropzone.hint")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
        >
          {t("dropzone.idle")}
        </Button>
      </div>

      {queue.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("fileQueueTitle")}
          </p>
          <ul className="space-y-2">
            {queue.map((it) => (
              <QueueRow
                key={it.id}
                item={it}
                onRemove={() => removeItem(it.id)}
                onRetry={() => updateItem(it.id, { state: { phase: "queued" } })}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function QueueRow({
  item,
  onRemove,
  onRetry,
}: {
  item: QueueItem
  onRemove: () => void
  onRetry: () => void
}) {
  const t = useTranslations("app.clientDetail.upload")
  const sizeKb = Math.max(1, Math.round(item.file.size / 1024))

  return (
    <li className="flex items-center gap-3 rounded-md border bg-card p-3">
      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium" title={item.file.name}>
            {item.file.name}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{sizeKb} KB</span>
        </div>
        <StatePill state={item.state} />
        {item.state.phase === "uploading" ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${item.state.percent}%` }}
            />
          </div>
        ) : null}
        {item.state.phase === "failed" ? (
          <p className="text-xs text-destructive">{item.state.error}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {item.state.phase === "uploading" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (item.state.phase === "uploading") item.state.cancel()
            }}
            aria-label={t("cancel")}
          >
            <X className="size-4" />
          </Button>
        ) : null}
        {item.state.phase === "failed" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRetry}
            aria-label={t("retry")}
          >
            <RotateCw className="size-4" />
          </Button>
        ) : null}
        {item.state.phase !== "uploading" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={t("remove")}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </li>
  )
}

function StatePill({ state }: { state: QueueState }) {
  const t = useTranslations("app.clientDetail.upload")
  switch (state.phase) {
    case "queued":
      return <span className="text-xs text-muted-foreground">…</span>
    case "uploading":
      return (
        <span className="text-xs text-muted-foreground">
          {t("transport", { percent: state.percent })}
        </span>
      )
    case "failed":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3" aria-hidden />
          {t("failed")}
        </span>
      )
  }
}
