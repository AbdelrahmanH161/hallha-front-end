"use client"

import { useState } from "react"
import Link from "next/link"

import {
  useClientsQuery,
  useCreateClientMutation,
} from "@/lib/api/queries/clients"

export default function ClientsPage() {
  const { data, isLoading } = useClientsQuery()
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audited clients</h1>
          <p className="text-sm text-muted-foreground">
            Each client gets isolated document storage and Sharia audits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New client
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          <p>No clients yet.</p>
          <p className="mt-2">Create one to start auditing their documents.</p>
        </div>
      ) : (
        <ul className="divide-y rounded-md border">
          {data?.items.map((c) => (
            <li key={c.id} className="flex items-center justify-between p-4">
              <div>
                <Link
                  href={`/clients/${c.id}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {c.industry ?? "No industry"} · {c.documentCount} documents
                </div>
              </div>
              <Link
                href={`/clients/${c.id}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showCreate ? <CreateClientDialog onClose={() => setShowCreate(false)} /> : null}
    </div>
  )
}

function CreateClientDialog({ onClose }: { onClose: () => void }) {
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
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-md bg-background p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">New audited client</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="client-name">
            Client name
          </label>
          <input
            id="client-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bank Alpha"
            className="w-full rounded-md border px-3 py-2 text-sm"
            autoFocus
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="client-industry">
            Industry (optional)
          </label>
          <input
            id="client-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Banking"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        {create.error ? (
          <div className="text-sm text-destructive">
            {(create.error as Error).message}
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending || !name.trim()}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  )
}
