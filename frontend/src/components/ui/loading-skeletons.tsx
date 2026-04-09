import { Skeleton } from "./skeleton";

export function DealCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl glass-card space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-24 rounded-2xl" />
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-12 bg-white/[0.03] border-b border-white/[0.08] flex items-center px-6 gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      <div className="p-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 border-b border-white/[0.05] flex items-center px-6 gap-4 last:border-0">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 rounded-2xl glass-card space-y-3">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
