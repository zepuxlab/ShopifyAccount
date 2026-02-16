// Customer Account API – Profile queries & mutations

export const GET_CUSTOMER = `
query GetCustomer {
  customer {
    id
    firstName
    lastName
    displayName
    email
    phone
    emailMarketingConsent {
      marketingState
      marketingOptInLevel
      consentUpdatedAt
    }
    smsMarketingConsent {
      marketingState
      marketingOptInLevel
      consentUpdatedAt
    }
    createdAt
    updatedAt
    numberOfOrders
    defaultAddress {
      id
      firstName
      lastName
      company
      address1
      address2
      city
      province
      provinceCode
      country
      countryCode
      zip
      phone
      formatted
    }
  }
}
`;

export const UPDATE_CUSTOMER = `
mutation UpdateCustomer($input: CustomerUpdateInput!) {
  customerUpdate(input: $input) {
    customer {
      id
      firstName
      lastName
      email
      phone
      emailMarketingConsent {
        marketingState
      }
      smsMarketingConsent {
        marketingState
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const GET_CUSTOMER_STATS = `
query GetCustomerStats {
  customer {
    id
    numberOfOrders
    orders(first: 250) {
      edges {
        node {
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
    createdAt
    lastOrder: orders(first: 1, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          processedAt
        }
      }
    }
  }
}
`;

// Admin API – Account management
export const DEACTIVATE_CUSTOMER = `
mutation DeactivateCustomer($customerId: ID!) {
  customerUpdate(input: { id: $customerId, state: DISABLED }) {
    customer {
      id
      state
    }
    userErrors {
      field
      message
    }
  }
}
`;
