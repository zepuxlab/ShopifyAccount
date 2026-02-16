import type { Customer, Order, Address, PaymentMethod, Review, WishlistItem } from "@/types/account";

export const mockCustomer: Customer = {
  id: "cust_001",
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex@example.com",
  phone: "+1 555 123 4567",
};

export const mockOrders: Order[] = [
  {
    id: "order_1",
    orderNumber: "#1042",
    processedAt: "2026-02-10T14:30:00Z",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    totalPrice: 159,
    currency: "USD",
    subtotal: 145,
    shippingPrice: 9,
    taxPrice: 5,
    lineItems: [
      { id: "li_1", title: "Classic Leather Bag", variantTitle: "Black", quantity: 1, price: 95, currency: "USD", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop" },
      { id: "li_2", title: "Silk Scarf", variantTitle: "Beige", quantity: 1, price: 50, currency: "USD", imageUrl: "https://images.unsplash.com/photo-1601924921557-45e8e0e6588f?w=120&h=120&fit=crop" },
    ],
    shippingAddress: { id: "addr_1", firstName: "Alex", lastName: "Johnson", address1: "123 Main St", city: "New York", zip: "10001", country: "United States", isDefault: true },
    trackingNumber: "1Z999AA10123456784",
    trackingUrl: "https://track.example.com/1Z999AA10123456784",
  },
  {
    id: "order_2",
    orderNumber: "#1038",
    processedAt: "2026-01-25T10:00:00Z",
    financialStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    totalPrice: 72,
    currency: "USD",
    subtotal: 65,
    shippingPrice: 5,
    taxPrice: 2,
    lineItems: [
      { id: "li_3", title: "Ceramic Vase", variantTitle: "White, L", quantity: 1, price: 65, currency: "USD", imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=120&h=120&fit=crop" },
    ],
    shippingAddress: { id: "addr_1", firstName: "Alex", lastName: "Johnson", address1: "123 Main St", city: "New York", zip: "10001", country: "United States", isDefault: true },
  },
  {
    id: "order_3",
    orderNumber: "#1029",
    processedAt: "2025-12-15T16:45:00Z",
    financialStatus: "refunded",
    fulfillmentStatus: "cancelled",
    totalPrice: 34,
    currency: "USD",
    subtotal: 30,
    shippingPrice: 4,
    taxPrice: 0,
    lineItems: [
      { id: "li_4", title: "Aromatic Candle", variantTitle: "Sandalwood", quantity: 2, price: 15, currency: "USD", imageUrl: "https://images.unsplash.com/photo-1602607167083-73f06e394fb4?w=120&h=120&fit=crop" },
    ],
    shippingAddress: { id: "addr_2", firstName: "Alex", lastName: "Johnson", address1: "456 Oak Ave", city: "Brooklyn", zip: "11201", country: "United States" },
  },
];

export const mockAddresses: Address[] = [
  { id: "addr_1", firstName: "Alex", lastName: "Johnson", address1: "123 Main St", address2: "Apt 42", city: "New York", province: "NY", zip: "10001", country: "United States", phone: "+1 555 123 4567", isDefault: true },
  { id: "addr_2", firstName: "Alex", lastName: "Johnson", address1: "456 Oak Ave", city: "Brooklyn", province: "NY", zip: "11201", country: "United States" },
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: "pm_1", brand: "Visa", lastFour: "4242", expiryMonth: 8, expiryYear: 2028, isDefault: true },
  { id: "pm_2", brand: "Mastercard", lastFour: "8888", expiryMonth: 3, expiryYear: 2027, isDefault: false },
];

export const mockReviews: Review[] = [
  { id: "rev_1", productId: "prod_1", productTitle: "Classic Leather Bag", productHandle: "leather-bag-classic", productImageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop", rating: 5, text: "Excellent bag! The leather is soft and the quality is top-notch. Highly recommend.", createdAt: "2026-02-12T08:00:00Z", status: "approved" },
  { id: "rev_2", productId: "prod_3", productTitle: "Ceramic Vase", productHandle: "ceramic-vase", productImageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=120&h=120&fit=crop", rating: 4, text: "Beautiful vase, but the packaging could have been better.", createdAt: "2026-01-28T12:00:00Z", status: "pending" },
];

export const mockWishlist: WishlistItem[] = [
  { id: "wl_1", productId: "prod_5", title: "Minimalist Watch", handle: "minimalist-watch", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&h=300&fit=crop", price: 125, compareAtPrice: 150, currency: "USD", availableForSale: true, addedAt: "2026-02-01T10:00:00Z" },
  { id: "wl_2", productId: "prod_6", title: "Linen Shirt", handle: "linen-shirt", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop", price: 48, currency: "USD", availableForSale: true, addedAt: "2026-01-20T14:00:00Z" },
  { id: "wl_3", productId: "prod_7", title: "Leather Wallet", handle: "leather-wallet", imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=300&fit=crop", price: 32, currency: "USD", availableForSale: false, addedAt: "2026-01-15T09:00:00Z" },
];

export function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}