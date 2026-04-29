export default function DashboardChatPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">AI Auditor Chat</h1>
      <p className="text-sm text-slate-300">
        Ask compliance questions and review AI-generated audit explanations.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <aside className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 lg:col-span-1">
          <h2 className="text-sm font-medium text-slate-200">Conversation Threads</h2>
          <p className="mt-2 text-xs text-slate-400">Recent chats placeholder.</p>
        </aside>

        <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-slate-200">Chat Window</h2>
          <div className="mt-3 rounded-lg border border-dashed border-slate-600 p-4 text-sm text-slate-400">
            AI chat interface placeholder
          </div>
        </article>
      </div>
    </section>
  )
}
