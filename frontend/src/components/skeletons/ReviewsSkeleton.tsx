import { Skeleton } from "@/components/ui/skeleton";

const ReviewsSkeleton = () => (
  <div className="space-y-8">
    <div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="mt-2 h-4 w-16" />
    </div>
    <div>
      <Skeleton className="mb-3 h-5 w-40" />
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
    <div>
      <Skeleton className="mb-3 h-5 w-28" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-4 w-28" />
                <Skeleton className="mt-3 h-12 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReviewsSkeleton;
