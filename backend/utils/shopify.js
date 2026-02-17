import fetch from "node-fetch";

const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-01";
const BASE_URL = `https://${SHOP_DOMAIN}`;

let openidConfigCache = null;
let customerAccountApiCache = null;
let adminTokenCache = null;
let adminTokenExpiresAt = 0;
let storefrontTokenCache = null;

export async function getAdminAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be set");
  }
  const now = Math.floor(Date.now() / 1000);
  if (adminTokenCache && adminTokenExpiresAt > now + 60) {
    return adminTokenCache;
  }
  const url = `${BASE_URL}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin token failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  adminTokenCache = data.access_token;
  adminTokenExpiresAt = now + (data.expires_in ?? 86399);
  return adminTokenCache;
}

export async function getStorefrontToken() {
  if (storefrontTokenCache) {
    return storefrontTokenCache;
  }
  const adminToken = await getAdminAccessToken();
  const listUrl = `${BASE_URL}/admin/api/${API_VERSION}/storefront_access_tokens.json`;
  const listRes = await fetch(listUrl, {
    headers: { "X-Shopify-Access-Token": adminToken },
  });
  if (listRes.ok) {
    const listData = await listRes.json();
    const tokens = listData.storefront_access_tokens ?? listData.storefront_access_token ?? [];
    const first = Array.isArray(tokens) ? tokens[0] : tokens;
    if (first?.access_token) {
      storefrontTokenCache = first.access_token;
      return storefrontTokenCache;
    }
  }
  const createMutation = `
    mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        userErrors { field message }
        storefrontAccessToken { accessToken }
      }
    }
  `;
  const gqlRes = await fetch(`${BASE_URL}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
    body: JSON.stringify({
      query: createMutation,
      variables: { input: { title: "Account App Storefront" } },
    }),
  });
  if (!gqlRes.ok) {
    const text = await gqlRes.text();
    throw new Error(`Storefront token create failed: ${gqlRes.status} ${text}`);
  }
  const gqlData = await gqlRes.json();
  const errs = gqlData?.data?.storefrontAccessTokenCreate?.userErrors;
  if (errs?.length) {
    throw new Error(errs.map((e) => e.message).join("; "));
  }
  const token = gqlData?.data?.storefrontAccessTokenCreate?.storefrontAccessToken?.accessToken;
  if (!token) {
    throw new Error("No storefront access token in response");
  }
  storefrontTokenCache = token;
  return storefrontTokenCache;
}

export async function getOpenIdConfig() {
  if (openidConfigCache) return openidConfigCache;
  const res = await fetch(`${BASE_URL}/.well-known/openid-configuration`);
  if (!res.ok) throw new Error("Failed to fetch OpenID configuration");
  openidConfigCache = await res.json();
  return openidConfigCache;
}

export async function getCustomerAccountApiConfig() {
  if (customerAccountApiCache) return customerAccountApiCache;
  const res = await fetch(`${BASE_URL}/.well-known/customer-account-api`);
  if (!res.ok) throw new Error("Failed to fetch Customer Account API config");
  customerAccountApiCache = await res.json();
  return customerAccountApiCache;
}

export async function adminRequest(path, options = {}) {
  const token = await getAdminAccessToken();
  const url = path.startsWith("http") ? path : `${BASE_URL}/admin/api/${API_VERSION}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

export async function adminGraphQL(query, variables = {}) {
  const token = await getAdminAccessToken();
  const url = `${BASE_URL}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin GraphQL failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function customerAccountGraphQL(accessToken, query, variables = {}) {
  const config = await getCustomerAccountApiConfig();
  const endpoint = config.graphql_api;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Customer Account GraphQL failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getCustomerAccountToken(code, redirectUri, codeVerifier) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be set in .env (OAuth app credentials from Dev Dashboard)"
    );
  }
  const config = await getOpenIdConfig();
  const tokenEndpoint = config.token_endpoint;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function refreshCustomerToken(refreshToken) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be set in .env (OAuth app credentials from Dev Dashboard)"
    );
  }
  const config = await getOpenIdConfig();
  const tokenEndpoint = config.token_endpoint;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh failed: ${res.status} ${text}`);
  }
  return res.json();
}

export function getShopDomain() {
  return SHOP_DOMAIN;
}

export function getClientId() {
  return CLIENT_ID;
}
