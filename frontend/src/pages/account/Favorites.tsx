import { mockWishlist } from "@/lib/mock-data";
import type { WishlistItem } from "@/types/account";

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

const Favorites = () => {
  const items: WishlistItem[] = mockWishlist;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your saved items</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="aspect-square w-full bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h2 className="line-clamp-2 text-sm font-medium text-foreground sm:text-base">
                  {item.title}
                </h2>
                <div className="mt-auto pt-2">
                  {item.compareAtPrice != null && item.compareAtPrice > item.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(item.compareAtPrice, item.currency)}
                    </span>
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {formatPrice(item.price, item.currency)}
                  </p>
                </div>
                {!item.availableForSale && (
                  <p className="mt-1 text-xs text-muted-foreground">Out of stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
