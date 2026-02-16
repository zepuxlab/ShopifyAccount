import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import OrdersSkeleton from "@/components/skeletons/OrdersSkeleton";
import { useOrders } from "@/hooks/useAccountApi";
import { formatPrice, formatDate } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  paid: "bg-badge-success-bg text-badge-success-fg",
  fulfilled: "bg-badge-success-bg text-badge-success-fg",
  pending: "bg-badge-warning-bg text-badge-warning-fg",
  unfulfilled: "bg-badge-warning-bg text-badge-warning-fg",
  refunded: "bg-badge-error-bg text-badge-error-fg",
  cancelled: "bg-badge-neutral-bg text-badge-neutral-fg",
};

const statusLabels: Record<string, string> = {
  paid: "Paid",
  fulfilled: "Fulfilled",
  pending: "Pending",
  unfulfilled: "Processing",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s] || "bg-badge-neutral-bg text-badge-neutral-fg"}`}>
      {statusLabels[s] || status}
    </span>
  );
}

function mapOrderNode(node: Record<string, unknown>) {
  const total = node.totalPrice as { amount: string; currencyCode: string } | undefined;
  const lineEdges = (node.lineItems as { edges: { node: Record<string, unknown> }[] })?.edges ?? [];
  const lineItems = lineEdges.map((e: { node: Record<string, unknown> }) => {
    const n = e.node;
    const variant = n.variant as { image?: { url: string } } | undefined;
    return {
      id: n.id ?? "",
      title: (n.title as string) ?? "",
      quantity: (n.quantity as number) ?? 0,
      imageUrl: variant?.image?.url,
    };
  });
  return {
    id: node.id as string,
    orderNumber: (node.orderNumber as string) ?? (node.name as string) ?? "",
    processedAt: (node.processedAt as string) ?? "",
    financialStatus: ((node.financialStatus as string) ?? "").toLowerCase(),
    fulfillmentStatus: ((node.fulfillmentStatus as string) ?? "").toLowerCase(),
    totalPrice: total ? parseFloat(String(total.amount)) : 0,
    currency: total?.currencyCode ?? "USD",
    lineItems,
  };
}

const Orders = () => {
  const { data, isLoading, isError, error } = useOrders(20);
  const orders = data?.customer?.orders?.edges?.map((e: { node: Record<string, unknown> }) => mapOrderNode(e.node)) ?? [];

  if (isLoading) return <OrdersSkeleton />;
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-destructive">{(error as Error)?.message ?? "Failed to load orders."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order, index) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block rounded-lg border border-border p-4 notion-transition hover:bg-notion-hover animate-fade-in"
              style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{order.orderNumber}</span>
                      <StatusBadge status={order.financialStatus} />
                      <StatusBadge status={order.fulfillmentStatus} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(order.processedAt)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {order.lineItems.slice(0, 3).map((item, i) => (
                        <div key={item.id || i} className="h-8 w-8 overflow-hidden rounded bg-secondary">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                      ))}
                      {order.lineItems.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{order.lineItems.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{formatPrice(order.totalPrice, order.currency)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
