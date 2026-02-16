// Customer Account API – Payment method queries & mutations

export const GET_PAYMENT_METHODS = `
query GetPaymentMethods {
  customer {
    id
    paymentMethods(first: 10) {
      edges {
        node {
          id
          instrument {
            ... on CustomerCreditCard {
              brand
              lastDigits
              expiryMonth
              expiryYear
              name
            }
            ... on CustomerPaypalBillingAgreement {
              paypalAccountEmail
            }
            ... on CustomerShopPayAgreement {
              name
              lastDigits
              expiryMonth
              expiryYear
            }
          }
        }
      }
    }
  }
}
`;

export const REVOKE_PAYMENT_METHOD = `
mutation RevokePaymentMethod($paymentMethodId: ID!) {
  customerPaymentMethodRevoke(paymentMethodId: $paymentMethodId) {
    revokedPaymentMethodId
    userErrors { field message }
  }
}
`;
