import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customerAccountQuery,
  backendRequest,
} from "@/lib/api/graphql";
import {
  GET_CUSTOMER,
  GET_CUSTOMER_STATS,
  UPDATE_CUSTOMER,
} from "@/lib/api/queries/customer";
import {
  GET_ORDERS,
  GET_ORDER_DETAILS,
} from "@/lib/api/queries/orders";
import {
  GET_ADDRESSES,
  CREATE_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  SET_DEFAULT_ADDRESS,
} from "@/lib/api/queries/addresses";
import {
  GET_PAYMENT_METHODS,
  REVOKE_PAYMENT_METHOD,
} from "@/lib/api/queries/payments";

export function useCustomer() {
  return useQuery({
    queryKey: ["customer"],
    queryFn: () => customerAccountQuery<{ customer: Record<string, unknown> }>(GET_CUSTOMER),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerStats() {
  return useQuery({
    queryKey: ["customer", "stats"],
    queryFn: () => customerAccountQuery<{ customer: Record<string, unknown> }>(GET_CUSTOMER_STATS),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { input: Record<string, unknown> }) =>
      customerAccountQuery<{ customerUpdate: { customer: unknown; userErrors: { field: string; message: string }[] } }>(
        UPDATE_CUSTOMER,
        payload
      ),
    onSuccess: (_, __, ctx) => {
      qc.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}

export function useOrders(first: number = 20, after?: string) {
  return useQuery({
    queryKey: ["orders", first, after],
    queryFn: () =>
      customerAccountQuery<{
        customer: {
          orders: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            edges: { cursor: string; node: Record<string, unknown> }[];
          };
        };
      }>(GET_ORDERS, { first, after: after ?? null }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () =>
      customerAccountQuery<{ customer: { order: Record<string, unknown> | null } }>(
        GET_ORDER_DETAILS,
        { orderId: orderId! }
      ),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () =>
      customerAccountQuery<{
        customer: {
          id: string;
          defaultAddress: { id: string } | null;
          addresses: { edges: { node: Record<string, unknown> }[] };
        };
      }>(GET_ADDRESSES),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (address: Record<string, unknown>) =>
      customerAccountQuery<{ customerAddressCreate: { customerAddress: unknown; userErrors: { message: string }[] } }>(
        CREATE_ADDRESS,
        { address }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Record<string, unknown> }) =>
      customerAccountQuery<{ customerAddressUpdate: { customerAddress: unknown; userErrors: { message: string }[] } }>(
        UPDATE_ADDRESS,
        { id, address }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      customerAccountQuery<{ customerAddressDelete: { deletedAddressId: string | null; userErrors: { message: string }[] } }>(
        DELETE_ADDRESS,
        { id }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      customerAccountQuery<{ customerDefaultAddressUpdate: { customer: unknown; userErrors: { message: string }[] } }>(
        SET_DEFAULT_ADDRESS,
        { addressId }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () =>
      customerAccountQuery<{ customer: { paymentMethods: { edges: { node: Record<string, unknown> }[] } } }>(
        GET_PAYMENT_METHODS
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevokePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      customerAccountQuery<{ customerPaymentMethodRevoke: { revokedPaymentMethodId: string | null; userErrors: { message: string }[] } }>(
        REVOKE_PAYMENT_METHOD,
        { paymentMethodId }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentMethods"] }),
  });
}

const GET_REVIEWS_METAFIELDS = `
  query GetReviews {
    customer {
      metafields(first: 50, namespace: "reviews") {
        edges {
          node {
            id
            key
            value
            type
          }
        }
      }
    }
  }
`;

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const data = await customerAccountQuery<{
        customer: {
          metafields?: { edges: { node: { id: string; key: string; value: string; type: string } }[] };
        };
      }>(GET_REVIEWS_METAFIELDS).catch(() => ({ customer: {} }));
      const edges = data?.customer?.metafields?.edges ?? [];
      return { reviews: edges.map((e) => e.node) };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDeactivateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) =>
      backendRequest<{ success: boolean; customer?: unknown }>("/api/admin/customer/deactivate", {
        method: "POST",
        body: JSON.stringify({ customerId }),
      }),
    onSuccess: () => {
      qc.clear();
    },
  });
}
