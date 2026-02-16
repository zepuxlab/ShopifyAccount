import { Star } from "lucide-react";
import ReviewsSkeleton from "@/components/skeletons/ReviewsSkeleton";
import { useReviews } from "@/hooks/useAccountApi";

const Reviews = () => {
  const { data, isLoading, isError } = useReviews();
  const reviews = data?.reviews ?? [];

  if (isLoading) return <ReviewsSkeleton />;
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="text-sm text-destructive">Failed to load reviews.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your product reviews</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Leave a review from your order details.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: { id: string; key: string; value: string }, index: number) => (
            <div key={r.id} className="rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-notion-yellow text-notion-yellow" />
                <span className="text-sm font-medium text-foreground">{r.key}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
