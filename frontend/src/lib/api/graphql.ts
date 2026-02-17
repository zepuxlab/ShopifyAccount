import { backendTokenExchange, backendRefresh, getBackendUrlPublic } from "./backend";

const TOKEN_KEY = "shopify_customer_token";
const REFRESH_KEY = "shopify_refresh_token";
const EXPIRY_KEY = "shopify_token_expiry";

export function getCustomerAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
}

export function clearCustomerTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() > Number(expiry);
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<void> {
  const redirectUri = `${window.location.origin}/callback`;
  const data = await backendTokenExchange(code, codeVerifier, redirectUri);
  setCustomerTokens(
    data.access_token,
    data.refresh_token ?? "",
    typeof data.expires_in === "number" ? data.expires_in : 3600
  );
}

export async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("No refresh token");
  const data = await backendRefresh(refreshToken);
  setCustomerTokens(
    data.access_token,
    data.refresh_token ?? refreshToken,
    typeof data.expires_in === "number" ? data.expires_in : 3600
  );
}

let customerApiUrlCache: string | null = null;

async function getCustomerAccountApiUrl(): Promise<string> {
  if (customerApiUrlCache) return customerApiUrlCache;
  const domain = import.meta.env.SHOPIFY_SHOP_DOMAIN;
  if (!domain) throw new Error("Missing SHOPIFY_SHOP_DOMAIN");
  const res = await fetch(`https://${domain}/.well-known/customer-account-api`);
  if (!res.ok) throw new Error("Failed to get Customer Account API config");
  const config = await res.json();
  customerApiUrlCache = config.graphql_api;
  if (!customerApiUrlCache) throw new Error("No graphql_api in config");
  return customerApiUrlCache;
}

async function ensureValidToken() {
  if (isTokenExpired()) {
    await refreshAccessToken();
  }
}

export async function customerAccountQuery<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  await ensureValidToken();
  const accessToken = getCustomerAccessToken();
  if (!accessToken) throw new Error("Not authenticated");

  const url = await getCustomerAccountApiUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) {
    try {
      await refreshAccessToken();
      const newToken = getCustomerAccessToken();
      if (newToken) {
        const retry = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify({ query, variables }),
        });
        const data = await retry.json();
        if (data.errors?.length) throw new Error(data.errors[0].message);
        return data.data as T;
      }
    } catch (_) {}
    throw new Error("Not authenticated");
  }

  const data = await res.json();
  if (data.errors?.length) throw new Error(data.errors[0].message);
  return data.data as T;
}

let storefrontTokenCache: string | null = null;

async function getStorefrontTokenFromBackend(): Promise<string> {
  if (storefrontTokenCache) return storefrontTokenCache;
  const base = getBackendUrlPublic();
  const res = await fetch(`${base}/api/storefront-token`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to get storefront token");
  }
  const data = await res.json();
  if (!data?.token) throw new Error("No token in storefront-token response");
  storefrontTokenCache = data.token;
  return storefrontTokenCache;
}

export async function storefrontQuery<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const domain = import.meta.env.SHOPIFY_SHOP_DOMAIN;
  if (!domain) throw new Error("Missing SHOPIFY_SHOP_DOMAIN");
  const token = await getStorefrontTokenFromBackend();

  const version = import.meta.env.SHOPIFY_API_VERSION || "2026-01";
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();
  if (data.errors?.length) throw new Error(data.errors[0].message);
  return data.data as T;
}

export async function backendRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getBackendUrlPublic();
  const token = getCustomerAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (res.status === 401) {
    try {
      await refreshAccessToken();
      const newToken = getCustomerAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        const retry = await fetch(`${base}${path}`, { ...options, headers });
        if (!retry.ok) {
          const err = await retry.json().catch(() => ({}));
          throw new Error(err?.error || String(retry.status));
        }
        return retry.json();
      }
    } catch (_) {}
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || String(res.status));
  }
  return res.json();
}
