import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardChatLoading() {
  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <header className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2 rounded-xl border bg-background/40 p-3">
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-background/40 p-4">
          <div className="flex-1 space-y-3">
            <Skeleton className="ms-auto h-16 w-2/3 rounded-2xl" />
            <Skeleton className="h-20 w-3/4 rounded-2xl" />
            <Skeleton className="ms-auto h-12 w-1/2 rounded-2xl" />
            <Skeleton className="h-24 w-3/4 rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </section>
  )
}
