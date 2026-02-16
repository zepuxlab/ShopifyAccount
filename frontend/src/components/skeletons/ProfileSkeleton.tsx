import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="mt-2 h-4 w-48" />
    </div>
    <div className="max-w-lg space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="mb-1.5 h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div>
        <Skeleton className="mb-1.5 h-4 w-12" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="mb-1.5 h-4 w-14" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-10 w-28 rounded-lg" />
    </div>
  </div>
);

export default ProfileSkeleton;
