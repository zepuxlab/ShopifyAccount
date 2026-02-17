import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  getCustomerAccessToken,
  setCustomerTokens,
  clearCustomerTokens,
  isTokenExpired,
} from "@/lib/api/graphql";
import { backendTokenExchange, backendRefresh } from "@/lib/api/backend";

const PKCE_VERIFIER_KEY = "pkce_code_verifier";
const PKCE_STATE_KEY = "pkce_state";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(message));
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

async function buildCodeChallenge(verifier: string): Promise<string> {
  const hash = await sha256(verifier);
  return base64UrlEncode(new Uint8Array(hash));
}

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (provider?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const shopDomain = () => {
  const d = import.meta.env.SHOPIFY_SHOP_DOMAIN;
  if (!d) throw new Error("Missing SHOPIFY_SHOP_DOMAIN");
  return d;
};

const clientId = () => {
  const c = import.meta.env.SHOPIFY_CLIENT_ID;
  if (!c) throw new Error("Missing SHOPIFY_CLIENT_ID");
  return c;
};

const redirectUri = () => {
  if (typeof window === "undefined") throw new Error("redirectUri only in browser");
  return `${window.location.origin}/callback`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem("shopify_refresh_token");
    if (!refresh) {
      clearCustomerTokens();
      setIsAuthenticated(false);
      setAccessToken(null);
      return;
    }
    try {
      const data = await backendRefresh(refresh);
      setCustomerTokens(data.access_token, data.refresh_token ?? refresh, data.expires_in ?? 3600);
      setAccessToken(data.access_token);
      setIsAuthenticated(true);
    } catch {
      clearCustomerTokens();
      setIsAuthenticated(false);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    const token = getCustomerAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    if (isTokenExpired()) {
      refreshToken().finally(() => setIsLoading(false));
    } else {
      setAccessToken(token);
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [refreshToken]);

  const login = useCallback(async () => {
    const verifier = base64UrlEncode(randomBytes(32));
    const challenge = await buildCodeChallenge(verifier);
    const state = base64UrlEncode(randomBytes(16));
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_STATE_KEY, state);

    const discoveryRes = await fetch(
      `https://${shopDomain()}/.well-known/openid-configuration`
    );
    if (!discoveryRes.ok) throw new Error("Failed to get OAuth config");
    const config = await discoveryRes.json();
    const authUrl = new URL(config.authorization_endpoint);
    authUrl.searchParams.set("client_id", clientId());
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri());
    authUrl.searchParams.set("scope", "openid email customer-account-api:full");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    window.location.href = authUrl.toString();
  }, []);

  const logout = useCallback(() => {
    clearCustomerTokens();
    setAccessToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
  }, []);

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredCodeVerifier(): string | null {
  return sessionStorage.getItem(PKCE_VERIFIER_KEY);
}

export function getStoredState(): string | null {
  return sessionStorage.getItem(PKCE_STATE_KEY);
}

export function clearStoredPkce() {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
}
