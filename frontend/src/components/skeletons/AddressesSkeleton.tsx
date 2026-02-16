import { Skeleton } from "@/components/ui/skeleton";

const AddressesSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="mt-0.5 h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-48" />
                <Skeleton className="mt-1 h-3 w-36" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AddressesSkeleton;
