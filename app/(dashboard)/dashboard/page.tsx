export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Compliance Dashboard</h1>
      <p className="text-sm text-slate-300">
        Monitor portfolio compliance and receive instant Sharia insights.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 lg:col-span-2">
          <h2 className="text-lg font-medium">Sharia Meter</h2>
          <div className="mt-3 h-3 rounded-full bg-slate-700">
            <div className="h-3 w-2/3 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-2 text-sm text-slate-300">Current score: 67% compliant (placeholder).</p>
        </article>

        <article className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
          <h2 className="text-lg font-medium">Alerts</h2>
          <p className="mt-2 text-sm text-slate-300">No critical violations detected.</p>
        </article>
      </div>
    </section>
  )
}
