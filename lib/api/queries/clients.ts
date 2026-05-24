import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"

import { apiFetch, API_URL } from "@/lib/api/client"
import type { ClientDocumentType } from "@/lib/types/retrieved-source"

export type AuditedClient = {
  id: string
  organizationId: string
  name: string
  industry: string | null
  description: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  documentCount: number
}

export type ClientDocumentStatus = "pending" | "ready" | "failed"

export type ClientDocument = {
  s3Key: string
  organizationId: string
  clientId: string
  documentType: ClientDocumentType
  originalName: string
  displayName: string
  uploadedAt: string
  uploadedBy: string
  sizeBytes: number
  status: ClientDocumentStatus
  error: string | null
  chunkCount: number | null
  processedAt: string | null
}

export type ClientDocumentStatusResponse = {
  status: ClientDocumentStatus
  error: string | null
  chunkCount: number | null
  processedAt: string | null
  document: ClientDocument
}

export const clientKeys = {
  all: ["clients"] as const,
  list: (params?: { search?: string; includeArchived?: boolean }) =>
    ["clients", "list", params ?? {}] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
  documents: (id: string, documentType?: ClientDocumentType) =>
    ["clients", id, "documents", documentType ?? null] as const,
  documentStatus: (clientId: string, documentId: string) =>
    ["clients", clientId, "documents", documentId, "status"] as const,
}

export function useClientsQuery(params?: {
  search?: string
  includeArchived?: boolean
}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => {
      const q = new URLSearchParams()
      if (params?.search) q.set("search", params.search)
      if (params?.includeArchived) q.set("includeArchived", "true")
      const suffix = q.toString() ? `?${q}` : ""
      return apiFetch<{ items: AuditedClient[]; nextCursor: string | null; hasMore: boolean }>(
        `/api/clients${suffix}`
      )
    },
  })
}

export function useClientQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: clientKeys.detail(id ?? ""),
    queryFn: () =>
      apiFetch<{ client: AuditedClient }>(`/api/clients/${id}`).then((r) => r.client),
    enabled: Boolean(id),
  })
}

export function useCreateClientMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; industry?: string; description?: string }) =>
      apiFetch<{ client: AuditedClient }>("/api/clients", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}

export function useUpdateClientMutation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      name?: string
      industry?: string | null
      description?: string | null
    }) =>
      apiFetch<{ client: AuditedClient }>(`/api/clients/${clientId}`, {
        method: "PATCH",
        body,
      }),
    onSuccess: (data) => {
      qc.setQueryData(clientKeys.detail(clientId), data.client)
      qc.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}

export function useArchiveClientMutation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<{ client: AuditedClient }>(`/api/clients/${clientId}/archive`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all })
    },
  })
}

export function useClientDocumentsQuery(
  clientId: string | null | undefined,
  documentType?: ClientDocumentType
) {
  return useQuery({
    queryKey: clientKeys.documents(clientId ?? "", documentType),
    queryFn: () => {
      const q = new URLSearchParams()
      if (documentType) q.set("documentType", documentType)
      const suffix = q.toString() ? `?${q}` : ""
      return apiFetch<{ items: ClientDocument[] }>(
        `/api/clients/${clientId}/documents${suffix}`
      ).then((r) => r.items)
    },
    enabled: Boolean(clientId),
  })
}

export type UploadAcceptedResponse = {
  status: "accepted"
  documentId: string
  statusUrl: string
  document: ClientDocument
}

/**
 * Upload a client document with progress callbacks. Uses XMLHttpRequest to
 * surface upload progress (fetch lacks upload progress events).
 *
 * The backend now returns **202 Accepted** with `{ documentId, statusUrl }` and runs
 * the heavy ingest (PDF parse + embedding + Pinecone upsert) in the background.
 * Callers should poll `statusUrl` (or use `useDocumentStatusQuery`) until status
 * flips to `ready` or `failed`.
 *
 * Pass `signal` from an `AbortController` to support user-initiated cancel.
 */
export function uploadClientDocument(opts: {
  clientId: string
  documentType: ClientDocumentType
  file: File
  displayName?: string
  onProgress?: (loaded: number, total: number) => void
  signal?: AbortSignal
  registerAbort?: (abort: () => void) => void
}): Promise<UploadAcceptedResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_URL}/api/clients/${opts.clientId}/documents`)
    xhr.withCredentials = true
    xhr.timeout = 0 // no client timeout — wait for server's 202
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0 && opts.onProgress) {
        opts.onProgress(ev.loaded, ev.total)
      }
    }
    xhr.onload = () => {
      const body: unknown = (() => {
        try {
          return xhr.responseText ? JSON.parse(xhr.responseText) : {}
        } catch {
          return {}
        }
      })()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as UploadAcceptedResponse)
      } else {
        const detail =
          typeof body === "object" && body !== null && "detail" in body
            ? String((body as { detail: unknown }).detail)
            : xhr.statusText
        reject(new Error(detail || xhr.statusText))
      }
    }
    xhr.onerror = () => reject(new Error("Network error"))
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"))

    const abort = () => {
      try {
        xhr.abort()
      } catch {
        /* noop */
      }
    }
    opts.registerAbort?.(abort)
    if (opts.signal) {
      if (opts.signal.aborted) {
        abort()
        return
      }
      opts.signal.addEventListener("abort", abort, { once: true })
    }

    const fd = new FormData()
    fd.append("file", opts.file)
    fd.append("documentType", opts.documentType)
    if (opts.displayName?.trim()) fd.append("displayName", opts.displayName.trim())
    xhr.send(fd)
  })
}

export function useUploadClientDocumentMutation(
  clientId: string,
  qc: QueryClient
) {
  return useMutation({
    mutationFn: (input: {
      file: File
      documentType: ClientDocumentType
      displayName?: string
      onProgress?: (loaded: number, total: number) => void
      signal?: AbortSignal
      registerAbort?: (abort: () => void) => void
    }) => uploadClientDocument({ clientId, ...input }),
    onSuccess: () => {
      // Refresh the documents list so the new 'pending' row appears in the UI.
      qc.invalidateQueries({ queryKey: clientKeys.documents(clientId) })
    },
  })
}

/**
 * Poll the backend for ingest completion. Refetches every ~2s while pending; stops once
 * the doc is `ready` or `failed`. Pair this with the 202 returned by `uploadClientDocument`.
 */
export function useDocumentStatusQuery(opts: {
  clientId: string | null | undefined
  documentId: string | null | undefined
  /** Stop polling once we hit a terminal state. */
  enabled?: boolean
}) {
  const enabled = (opts.enabled ?? true) && Boolean(opts.clientId && opts.documentId)
  return useQuery({
    queryKey: clientKeys.documentStatus(opts.clientId ?? "", opts.documentId ?? ""),
    queryFn: () =>
      apiFetch<ClientDocumentStatusResponse>(
        `/api/clients/${opts.clientId}/documents/${encodeURIComponent(
          opts.documentId ?? ""
        )}/status`
      ),
    enabled,
    refetchInterval: (q) => {
      const data = q.state.data as ClientDocumentStatusResponse | undefined
      if (data?.status === "ready" || data?.status === "failed") return false
      return 2000
    },
    refetchOnWindowFocus: false,
  })
}

export function useDeleteClientDocumentMutation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (s3Key: string) =>
      apiFetch<{ ok: true }>(`/api/clients/${clientId}/documents`, {
        method: "DELETE",
        body: { s3Key },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.documents(clientId) })
      qc.invalidateQueries({ queryKey: clientKeys.detail(clientId) })
    },
  })
}
