export default function TransactionsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <p className="text-sm text-slate-300">
        Manage Zakat and purification workflows for flagged transactions.
      </p>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4">
        <h2 className="text-lg font-medium">Zakat & Purification Queue</h2>
        <div className="mt-3 rounded-lg border border-dashed border-slate-600 p-4 text-sm text-slate-400">
          Transaction table and action controls placeholder
        </div>
      </div>
    </section>
  )
}
