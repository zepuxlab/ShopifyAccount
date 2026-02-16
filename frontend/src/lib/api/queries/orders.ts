// Customer Account API – Order queries

export const GET_ORDERS = `
query GetOrders($first: Int!, $after: String) {
  customer {
    orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          cancelReason
          canceledAt
          totalPrice {
            amount
            currencyCode
          }
          subtotalPrice {
            amount
            currencyCode
          }
          totalShippingPrice {
            amount
            currencyCode
          }
          totalTax {
            amount
            currencyCode
          }
          lineItems(first: 3) {
            edges {
              node {
                title
                quantity
                variant {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

export const GET_ORDER_DETAILS = `
query GetOrderDetails($orderId: ID!) {
  customer {
    order(id: $orderId) {
      id
      name
      orderNumber
      processedAt
      financialStatus
      fulfillmentStatus
      cancelReason
      canceledAt
      customerUrl
      totalPrice { amount currencyCode }
      subtotalPrice { amount currencyCode }
      totalShippingPrice { amount currencyCode }
      totalTax { amount currencyCode }
      totalRefunded { amount currencyCode }
      lineItems(first: 50) {
        edges {
          node {
            title
            quantity
            variant {
              id
              title
              sku
              price { amount currencyCode }
              image { url altText width height }
              product { id handle title }
            }
            originalTotalPrice { amount currencyCode }
            discountedTotalPrice { amount currencyCode }
          }
        }
      }
      shippingAddress {
        firstName lastName company address1 address2
        city province provinceCode country countryCode zip phone formatted
      }
      billingAddress {
        firstName lastName company address1 address2
        city province provinceCode country countryCode zip phone formatted
      }
      shippingLine {
        title
        price { amount currencyCode }
      }
      fulfillments(first: 10) {
        trackingCompany
        trackingInfo { number url }
        fulfillmentLineItems(first: 50) {
          edges {
            node {
              quantity
              lineItem { title }
            }
          }
        }
      }
      discountApplications(first: 10) {
        edges {
          node {
            ... on DiscountCodeApplication {
              code
              applicable
              value {
                ... on MoneyV2 { amount currencyCode }
                ... on PricingPercentageValue { percentage }
              }
            }
            ... on AutomaticDiscountApplication {
              title
              value {
                ... on MoneyV2 { amount currencyCode }
                ... on PricingPercentageValue { percentage }
              }
            }
          }
        }
      }
      returns(first: 10) {
        id
        name
        status
        totalQuantity
      }
    }
  }
}
`;

export const GET_ORDERS_BY_STATUS = `
query GetOrdersByStatus($first: Int!, $query: String!) {
  customer {
    orders(first: $first, query: $query, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          id
          name
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice { amount currencyCode }
        }
      }
    }
  }
}
`;

export const GET_RETURNS = `
query GetReturns {
  customer {
    orders(first: 50) {
      edges {
        node {
          id
          name
          returns(first: 10) {
            id
            name
            status
            totalQuantity
            returnLineItems(first: 50) {
              edges {
                node {
                  quantity
                  returnReason
                  customerNote
                  fulfillmentLineItem {
                    lineItem {
                      title
                      variant {
                        image { url }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;
