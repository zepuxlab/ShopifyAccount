// Storefront API – Cart, Search, Localization

export const CREATE_CART = `
mutation CreateCart($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id title
                price { amount currencyCode }
              }
            }
          }
        }
      }
      cost {
        totalAmount { amount currencyCode }
        subtotalAmount { amount currencyCode }
      }
    }
    userErrors { field message }
  }
}
`;

export const ADD_TO_CART = `
mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id checkoutUrl totalQuantity
    }
    userErrors { field message }
  }
}
`;

export const SEARCH_PRODUCTS = `
query SearchProducts($query: String!, $first: Int!) {
  products(first: $first, query: $query) {
    edges {
      node {
        id title handle
        featuredImage { url altText }
        priceRange {
          minVariantPrice { amount currencyCode }
        }
      }
    }
  }
}
`;

export const GET_MARKETS = `
query GetMarkets {
  localization {
    availableCountries {
      isoCode name
      currency { isoCode name symbol }
    }
    country {
      isoCode name
      currency { isoCode }
    }
  }
}
`;

export const GET_LANGUAGES = `
query GetLanguages {
  localization {
    availableLanguages { isoCode name endonymName }
    language { isoCode name }
  }
}
`;
