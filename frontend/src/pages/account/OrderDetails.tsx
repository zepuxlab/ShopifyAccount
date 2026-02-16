import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ExternalLink, RotateCcw, Star, CheckCircle2, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/mock-data";
import { useOrder } from "@/hooks/useAccountApi";

const statusLabels: Record<string, string> = {
  paid: "Paid", fulfilled: "Fulfilled", pending: "Pending",
  unfulfilled: "Processing", refunded: "Refunded", cancelled: "Cancelled",
};
const statusColors: Record<string, string> = {
  paid: "bg-badge-success-bg text-badge-success-fg",
  fulfilled: "bg-badge-success-bg text-badge-success-fg",
  pending: "bg-badge-warning-bg text-badge-warning-fg",
  unfulfilled: "bg-badge-warning-bg text-badge-warning-fg",
  refunded: "bg-badge-error-bg text-badge-error-fg",
  cancelled: "bg-badge-neutral-bg text-badge-neutral-fg",
};

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s] || "bg-badge-neutral-bg text-badge-neutral-fg"}`}>
      {statusLabels[s] || status}
    </span>
  );
}

interface TimelineStep { label: string; date?: string; completed: boolean; }

function getOrderTimeline(o: {
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
}): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const orderDate = formatDate(o.processedAt);
  const fin = (o.financialStatus ?? "").toLowerCase();
  const ful = (o.fulfillmentStatus ?? "").toLowerCase();
  if (ful === "cancelled") {
    steps.push({ label: "Confirmed", date: orderDate, completed: true });
    steps.push({ label: "Cancelled", date: orderDate, completed: true });
    return steps;
  }
  steps.push({ label: "Confirmed", date: orderDate, completed: true });
  steps.push({ label: fin === "paid" ? "Paid" : "Payment pending", date: fin === "paid" ? orderDate : undefined, completed: fin === "paid" });
  if (ful === "fulfilled") {
    steps.push({ label: "Shipped", date: orderDate, completed: true });
    steps.push({ label: "Complete", date: orderDate, completed: true });
  } else if (ful === "partial") {
    steps.push({ label: "Partially shipped", completed: true });
    steps.push({ label: "Complete", completed: false });
  } else {
    steps.push({ label: "Shipped", completed: false });
    steps.push({ label: "Complete", completed: false });
  }
  return steps;
}

const OrderDetailsSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-4 w-20" />
    <div><Skeleton className="h-8 w-32" /><Skeleton className="mt-2 h-4 w-24" /></div>
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-4 w-28" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
    <div className="rounded-lg border border-border">
      <div className="border-b border-border px-4 py-3"><Skeleton className="h-4 w-12" /></div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1"><Skeleton className="h-4 w-36" /><Skeleton className="mt-1 h-3 w-16" /></div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  </div>
);

function mapOrder(raw: Record<string, unknown> | null) {
  if (!raw) return null;
  const totalPrice = raw.totalPrice as { amount: string; currencyCode: string } | undefined;
  const subtotalPrice = raw.subtotalPrice as { amount: string } | undefined;
  const totalShippingPrice = raw.totalShippingPrice as { amount: string } | undefined;
  const totalTax = raw.totalTax as { amount: string } | undefined;
  const lineEdges = (raw.lineItems as { edges: { node: Record<string, unknown> }[] })?.edges ?? [];
  const lineItems = lineEdges.map((e: { node: Record<string, unknown> }) => {
    const n = e.node;
    const variant = n.variant as Record<string, unknown> | undefined;
    const price = variant?.price as { amount: string; currencyCode: string } | undefined;
    const img = variant?.image as { url: string } | undefined;
    return {
      id: n.id ?? "",
      title: n.title ?? "",
      variantTitle: variant?.title as string | undefined,
      quantity: (n.quantity as number) ?? 0,
      price: price ? parseFloat(String(price.amount)) : 0,
      currency: price?.currencyCode ?? "USD",
      imageUrl: img?.url,
    };
  });
  const shippingAddress = raw.shippingAddress as Record<string, string> | undefined;
  const fulfillments = (raw.fulfillments as { trackingInfo: { number?: string; url?: string }[] }[]) ?? [];
  const firstTracking = fulfillments[0]?.trackingInfo?.[0];
  return {
    id: raw.id as string,
    orderNumber: (raw.orderNumber as string) ?? (raw.name as string) ?? "",
    processedAt: (raw.processedAt as string) ?? "",
    financialStatus: ((raw.financialStatus as string) ?? "").toLowerCase(),
    fulfillmentStatus: ((raw.fulfillmentStatus as string) ?? "").toLowerCase(),
    totalPrice: totalPrice ? parseFloat(String(totalPrice.amount)) : 0,
    currency: totalPrice?.currencyCode ?? "USD",
    subtotal: subtotalPrice ? parseFloat(String(subtotalPrice.amount)) : 0,
    shippingPrice: totalShippingPrice ? parseFloat(String(totalShippingPrice.amount)) : 0,
    taxPrice: totalTax ? parseFloat(String(totalTax.amount)) : 0,
    discountAmount: 0,
    lineItems,
    shippingAddress: shippingAddress
      ? {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        }
      : undefined,
    trackingNumber: firstTracking?.number,
    trackingUrl: firstTracking?.url,
  };
}

const OrderDetails = () => {
  const { orderId } = useParams();
  const { data, isLoading, isError, error } = useOrder(orderId);
  const rawOrder = data?.customer?.order as Record<string, unknown> | null | undefined;
  const order = mapOrder(rawOrder ?? null);

  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError || !order) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to orders
        </Link>
        <p className="text-muted-foreground">{(error as Error)?.message ?? "Order not found"}</p>
      </div>
    );
  }

  const timeline = getOrderTimeline(order);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Orders
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{order.orderNumber}</h1>
          <StatusBadge status={order.financialStatus} />
          <StatusBadge status={order.fulfillmentStatus} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.processedAt)}</p>
      </div>

      <div className="rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "100ms", opacity: 0 }}>
        <h2 className="mb-4 text-sm font-medium text-foreground">Order progress</h2>
        <div className="space-y-0">
          {timeline.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {step.completed ? <CheckCircle2 className="h-5 w-5 text-foreground" /> : <Circle className="h-5 w-5 text-border" />}
                {i < timeline.length - 1 && (
                  <div className={`my-1 h-6 w-px ${timeline[i + 1].completed ? "bg-foreground/30" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-2">
                <p className={`text-sm ${step.completed ? "font-medium text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                {step.date && <p className="text-xs text-muted-foreground">{step.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "200ms", opacity: 0 }}>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
          <RotateCcw className="h-4 w-4" /> Buy again
        </button>
        {order.trackingUrl && (
          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
            <ExternalLink className="h-4 w-4" /> Track order
          </a>
        )}
        {order.fulfillmentStatus === "fulfilled" && (
          <Link to="/account/reviews" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
            <Star className="h-4 w-4" /> Leave a review
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border animate-fade-in" style={{ animationDelay: "300ms", opacity: 0 }}>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-foreground">Items</h2>
        </div>
        <div className="divide-y divide-border">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.variantTitle && <p className="text-xs text-muted-foreground">{item.variantTitle}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground">{formatPrice(item.price, item.currency)}</p>
                <p className="text-xs text-muted-foreground">× {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "400ms", opacity: 0 }}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(order.subtotal, order.currency)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatPrice(order.shippingPrice, order.currency)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{formatPrice(order.taxPrice, order.currency)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-notion-green"><span>Discount</span><span>−{formatPrice(order.discountAmount, order.currency)}</span></div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground"><span>Total</span><span>{formatPrice(order.totalPrice, order.currency)}</span></div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "500ms", opacity: 0 }}>
          <h3 className="mb-2 text-sm font-medium text-foreground">Shipping address</h3>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}<br />
            {order.shippingAddress.city}, {order.shippingAddress.zip}<br />
            {order.shippingAddress.country}
          </p>
        </div>
      )}

      {order.trackingNumber && (
        <div className="rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "600ms", opacity: 0 }}>
          <h3 className="mb-1 text-sm font-medium text-foreground">Tracking</h3>
          <p className="text-sm text-muted-foreground">{order.trackingNumber}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
