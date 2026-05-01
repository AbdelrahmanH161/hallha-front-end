import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardChatLoading() {
  return (
    <div className="relative flex h-svh w-full overflow-hidden bg-background">
      <aside className="flex w-[268px] flex-col gap-2 border-e bg-card/50 p-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </aside>
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-card/40 px-5 py-3">
          <Skeleton className="h-7 w-40" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex-1 space-y-3 p-6">
          <Skeleton className="ms-auto h-16 w-2/3 rounded-2xl" />
          <Skeleton className="h-20 w-3/4 rounded-2xl" />
          <Skeleton className="ms-auto h-12 w-1/2 rounded-2xl" />
          <Skeleton className="h-24 w-3/4 rounded-2xl" />
        </div>
        <div className="p-5">
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  )
}
