import { customerAccountGraphQL } from "../utils/shopify.js";

const GID_CUSTOMER = /^gid:\/\/shopify\/Customer\/\d+$/;
const GID_METAFIELD = /^gid:\/\/shopify\/Metafield\/\d+$/;

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7).trim();
  req.shopifyAccessToken = token;
  next();
};

export async function requireAuthWithCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7).trim();
  req.shopifyAccessToken = token;
  try {
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
    req.customerId = customer.id;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message || "Authorization failed" });
  }
}

export function parseCustomerGid(id) {
  if (!id || typeof id !== "string") return null;
  const m = String(id).trim().match(GID_CUSTOMER);
  return m ? id : null;
}

export function parseMetafieldGid(id) {
  if (!id || typeof id !== "string") return null;
  const m = String(id).trim().match(GID_METAFIELD);
  return m ? id : null;
}

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    req.shopifyAccessToken = authHeader.slice(7);
  }
  next();
};
