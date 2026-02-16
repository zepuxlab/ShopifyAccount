import { Skeleton } from "@/components/ui/skeleton";

const PaymentMethodsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-44" />
      <Skeleton className="mt-2 h-4 w-52" />
    </div>
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PaymentMethodsSkeleton;
