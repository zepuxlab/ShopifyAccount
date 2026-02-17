import "./loadEnv.js";
import express from "express";
import corsMiddleware from "./middleware/cors.js";
import { authLimiter } from "./middleware/rateLimit.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import {
  adminGraphQL,
  getOpenIdConfig,
  getCustomerAccountApiConfig,
  getStorefrontToken,
} from "./utils/shopify.js";

const app = express();
const PORT = process.env.PORT || 3601;
const startedAt = Date.now();

app.use(express.json({ limit: "1mb" }));
app.use(corsMiddleware);

app.get("/health", async (req, res) => {
  const timestamp = new Date().toISOString();
  let adminApi = "error";
  let customerApi = "error";
  try {
    await adminGraphQL("{ shop { name } }");
    adminApi = "ok";
  } catch (_) {}
  try {
    await getOpenIdConfig();
    await getCustomerAccountApiConfig();
    customerApi = "ok";
  } catch (_) {}
  res.json({
    status: "ok",
    timestamp,
    shopify: { admin_api: adminApi, customer_api: customerApi },
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);

app.get("/api/storefront-token", apiLimiter, async (req, res) => {
  try {
    const token = await getStorefrontToken();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get storefront token" });
  }
});

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS not allowed" });
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
