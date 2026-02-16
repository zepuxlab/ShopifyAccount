const getBackendUrl = (): string => {
  if (typeof window === "undefined") throw new Error("getBackendUrl only in browser");
  return window.location.origin.replace(/\/$/, "");
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
