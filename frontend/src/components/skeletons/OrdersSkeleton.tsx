import { Skeleton } from "@/components/ui/skeleton";

const OrdersSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-20" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-18 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-3 w-24" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default OrdersSkeleton;
