export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  currency: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  processedAt: string;
  financialStatus: "paid" | "pending" | "refunded" | "partially_refunded";
  fulfillmentStatus: "fulfilled" | "unfulfilled" | "partial" | "cancelled";
  totalPrice: number;
  currency: string;
  lineItems: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  subtotal: number;
  shippingPrice: number;
  taxPrice: number;
  discountAmount?: number;
  trackingUrl?: string;
  trackingNumber?: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string;
  productHandle: string;
  rating: number;
  text: string;
  createdAt: string;
  status: "approved" | "pending" | "rejected";
}

export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  handle: string;
  imageUrl?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  availableForSale: boolean;
  addedAt: string;
}
