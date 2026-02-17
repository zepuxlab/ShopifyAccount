import { Router } from "express";
import {
  getCustomerAccountToken,
  refreshCustomerToken,
  customerAccountGraphQL,
} from "../utils/shopify.js";

const router = Router();

const GID_CUSTOMER = /^gid:\/\/shopify\/Customer\/\d+$/;

router.use((req, res, next) => {
  console.log("[auth]", req.method, req.path, Object.keys(req.query).length ? req.query : "");
  next();
});

router.get("/ping", (req, res) => res.json({ pong: true }));

router.get("/callback-debug", (req, res) => {
  const { hasCode, hasState, error } = req.query;
  console.log("[auth] callback hit:", { hasCode, hasState, error: error || null });
  res.json({ ok: true });
});

router.post("/token", async (req, res) => {
  try {
    console.log("[auth] token exchange request");
    const { code, codeVerifier, redirect_uri } = req.body;
    const verifier = codeVerifier ?? req.body.code_verifier;
    const redirectUri = redirect_uri ?? req.body.redirect_uri;
    if (!code || !verifier || !redirectUri) {
      return res.status(400).json({ error: "code, codeVerifier and redirect_uri required" });
    }
    const codeStr = String(code).trim();
    const redirectStr = String(redirectUri).trim();
    if (!codeStr) {
      return res.status(400).json({ error: "code cannot be empty" });
    }
    if (String(verifier).length < 43) {
      return res.status(400).json({ error: "codeVerifier must be at least 43 characters" });
    }
    if (!/^https?:\/\//.test(redirectStr)) {
      return res.status(400).json({ error: "Invalid redirect_uri" });
    }
    const tokens = await getCustomerAccountToken(codeStr, redirectStr, String(verifier));
    console.log("[auth] token exchange success");
    res.json(tokens);
  } catch (err) {
    console.error("[auth] token exchange error:", err.message);
    res.status(400).json({ error: err.message || "Token exchange failed" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken, refresh_token } = req.body;
    const token = refreshToken ?? refresh_token;
    if (!token) {
      return res.status(400).json({ error: "refreshToken required" });
    }
    const tokenStr = String(token).trim();
    if (!tokenStr) {
      return res.status(400).json({ error: "refreshToken cannot be empty" });
    }
    const tokens = await refreshCustomerToken(tokenStr);
    res.json(tokens);
  } catch (err) {
    res.status(400).json({ error: err.message || "Refresh failed" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const token = accessToken ?? (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return res.status(400).json({ error: "accessToken required" });
    }
    const result = await customerAccountGraphQL(token, `
      query {
        customer {
          id
          emailAddress { emailAddress }
        }
      }
    `);
    const customer = result?.data?.customer;
    if (!customer) {
      const err = result?.errors?.[0]?.message || "Invalid or expired token";
      return res.status(401).json({ error: err });
    }
    res.json({
      success: true,
      customerId: customer.id,
      email: customer.emailAddress?.emailAddress ?? null,
    });
  } catch (err) {
    res.status(401).json({ error: err.message || "Verify failed" });
  }
});

export default router;
