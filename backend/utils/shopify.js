import fetch from "node-fetch";

const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";
const BASE_URL = `https://${SHOP_DOMAIN}`;

let openidConfigCache = null;
let customerAccountApiCache = null;

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

export function adminRequest(path, options = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}/admin/api/${API_VERSION}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": ADMIN_TOKEN,
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

export async function adminGraphQL(query, variables = {}) {
  const url = `${BASE_URL}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
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
  const config = await getOpenIdConfig();
  const tokenEndpoint = config.token_endpoint;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });
  if (CLIENT_SECRET) {
    body.append("client_secret", CLIENT_SECRET);
  }
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function refreshCustomerToken(refreshToken) {
  const config = await getOpenIdConfig();
  const tokenEndpoint = config.token_endpoint;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });
  if (CLIENT_SECRET) {
    body.append("client_secret", CLIENT_SECRET);
  }
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
