const getBackendUrl = (): string => {
  const url = import.meta.env.DEV
    ? import.meta.env.SHOPIFY_BACKEND_URL
    : import.meta.env.SHOPIFY_BACKEND_URL_PROD;
  if (!url) throw new Error("Missing SHOPIFY_BACKEND_URL");
  return url.replace(/\/$/, "");
};

export async function backendTokenExchange(code: string, codeVerifier: string, redirectUri: string) {
  const res = await fetch(`${getBackendUrl()}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, codeVerifier, redirect_uri: redirectUri }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Token exchange failed");
  }
  return res.json();
}

export async function backendRefresh(refreshToken: string) {
  const res = await fetch(`${getBackendUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Refresh failed");
  }
  return res.json();
}

export async function backendVerify(accessToken: string) {
  const res = await fetch(`${getBackendUrl()}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Verify failed");
  }
  return res.json();
}

export function getBackendUrlPublic() {
  return getBackendUrl();
}
