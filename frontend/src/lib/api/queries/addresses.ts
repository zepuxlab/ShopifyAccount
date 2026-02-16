// Customer Account API – Address queries & mutations

export const GET_ADDRESSES = `
query GetAddresses {
  customer {
    id
    defaultAddress { id }
    addresses(first: 20) {
      edges {
        node {
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
  }
}
`;

export const CREATE_ADDRESS = `
mutation CreateAddress($address: CustomerAddressInput!) {
  customerAddressCreate(address: $address) {
    customerAddress {
      id firstName lastName address1 address2
      city province country zip phone
    }
    userErrors { field message }
  }
}
`;

export const UPDATE_ADDRESS = `
mutation UpdateAddress($id: ID!, $address: CustomerAddressInput!) {
  customerAddressUpdate(id: $id, address: $address) {
    customerAddress {
      id firstName lastName address1 city country zip
    }
    userErrors { field message }
  }
}
`;

export const DELETE_ADDRESS = `
mutation DeleteAddress($id: ID!) {
  customerAddressDelete(id: $id) {
    deletedAddressId
    userErrors { field message }
  }
}
`;

export const SET_DEFAULT_ADDRESS = `
mutation SetDefaultAddress($addressId: ID!) {
  customerDefaultAddressUpdate(addressId: $addressId) {
    customer {
      id
      defaultAddress { id formatted }
    }
    userErrors { field message }
  }
}
`;
