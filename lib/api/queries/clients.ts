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
}

export const clientKeys = {
  all: ["clients"] as const,
  list: (params?: { search?: string; includeArchived?: boolean }) =>
    ["clients", "list", params ?? {}] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
  documents: (id: string, documentType?: ClientDocumentType) =>
    ["clients", id, "documents", documentType ?? null] as const,
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

/**
 * Upload a client document with progress callbacks. Uses XMLHttpRequest to
 * surface upload progress; matches the admin SPA pattern.
 */
export function uploadClientDocument(opts: {
  clientId: string
  documentType: ClientDocumentType
  file: File
  displayName?: string
  onProgress?: (loaded: number, total: number) => void
}): Promise<{ status: string; document: ClientDocument }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_URL}/api/clients/${opts.clientId}/documents`)
    xhr.withCredentials = true
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
        resolve(body as { status: string; document: ClientDocument })
      } else {
        const detail =
          typeof body === "object" && body !== null && "detail" in body
            ? String((body as { detail: unknown }).detail)
            : xhr.statusText
        reject(new Error(detail || xhr.statusText))
      }
    }
    xhr.onerror = () => reject(new Error("Network error"))
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
    }) => uploadClientDocument({ clientId, ...input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.documents(clientId) })
      qc.invalidateQueries({ queryKey: clientKeys.detail(clientId) })
      qc.invalidateQueries({ queryKey: clientKeys.all })
    },
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
