import { Router } from "express";
import { adminGraphQL } from "../utils/shopify.js";
import {
  requireAuthWithCustomer,
  parseCustomerGid,
  parseMetafieldGid,
} from "../middleware/auth.js";

const router = Router();
const WISHLIST_MAX_ITEMS = 250;

const PROFILES_QUERY = `
  query {
    checkoutProfiles(first: 1, query: "is_published:true") {
      nodes { id }
    }
  }
`;

const BRANDING_QUERY = `
  query GetBranding($checkoutProfileId: ID!) {
    checkoutBranding(checkoutProfileId: $checkoutProfileId) {
      designSystem {
        colors { global { accent brand success warning critical info decorative } }
        typography { primary { name } }
      }
      customizations {
        primaryButton { background text }
        logo { image { url } }
      }
    }
  }
`;

router.get("/branding", async (req, res) => {
  try {
    const profilesData = await adminGraphQL(PROFILES_QUERY);
    const nodes = profilesData?.data?.checkoutProfiles?.nodes;
    const profileId = nodes?.[0]?.id;
    if (!profileId) {
      return res.json({
        success: true,
        data: { shop: { checkoutProfiles: { edges: [] } } },
      });
    }
    const brandingData = await adminGraphQL(BRANDING_QUERY, {
      checkoutProfileId: profileId,
    });
    const b = brandingData?.data?.checkoutBranding;
    const node = b
      ? {
          id: profileId,
          branding: {
            primaryButton: b.customizations?.primaryButton,
            colors: { global: b.designSystem?.colors?.global },
            typography: b.designSystem?.typography,
            logo: b.customizations?.logo,
          },
        }
      : { id: profileId, branding: null };
    res.json({
      success: true,
      data: { shop: { checkoutProfiles: { edges: [{ node }] } } },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Branding request failed" });
  }
});

router.post("/customer/deactivate", requireAuthWithCustomer, async (req, res) => {
  try {
    const { customerId } = req.body;
    const gid = parseCustomerGid(customerId);
    if (!gid) {
      return res.status(400).json({ error: "customerId must be GID format: gid://shopify/Customer/{id}" });
    }
    if (gid !== req.customerId) {
      return res.status(403).json({ error: "Forbidden: cannot deactivate another customer" });
    }
    const result = await adminGraphQL(
      `mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id state }
          userErrors { field message }
        }
      }`,
      { input: { id: gid, state: "DISABLED" } }
    );
    const errs = result?.data?.customerUpdate?.userErrors;
    if (errs?.length) {
      return res.status(400).json({ error: errs.map((e) => e.message).join("; ") });
    }
    const customer = result?.data?.customerUpdate?.customer;
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ error: err.message || "Deactivate failed" });
  }
});

router.post("/metafields/set", requireAuthWithCustomer, async (req, res) => {
  try {
    const { metafields } = req.body;
    if (!Array.isArray(metafields) || metafields.length === 0) {
      return res.status(400).json({ error: "metafields array required" });
    }
    for (const m of metafields) {
      const ownerGid = parseCustomerGid(m.ownerId);
      if (!ownerGid) {
        return res.status(400).json({ error: "Each metafield must have ownerId as gid://shopify/Customer/{id}" });
      }
      if (ownerGid !== req.customerId) {
        return res.status(403).json({ error: "Forbidden: ownerId must match logged-in customer" });
      }
    }
    const wishlistItems = metafields.filter(
      (m) => (m.namespace === "wishlist" && m.key === "products") || m.type === "list.product_reference"
    );
    for (const w of wishlistItems) {
      let arr = [];
      try {
        arr = typeof w.value === "string" ? JSON.parse(w.value) : w.value;
      } catch (_) {
        return res.status(400).json({ error: "wishlist value must be valid JSON array" });
      }
      if (!Array.isArray(arr) || arr.length > WISHLIST_MAX_ITEMS) {
        return res.status(400).json({ error: `wishlist cannot exceed ${WISHLIST_MAX_ITEMS} items` });
      }
    }
    const input = metafields.map((m) => ({
      ownerId: m.ownerId,
      namespace: m.namespace,
      key: m.key,
      type: m.type || "json",
      value: typeof m.value === "string" ? m.value : JSON.stringify(m.value),
    }));
    const result = await adminGraphQL(
      `mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id namespace key value }
          userErrors { field message }
        }
      }`,
      { metafields: input }
    );
    const errs = result?.data?.metafieldsSet?.userErrors;
    if (errs?.length) {
      return res.status(400).json({ error: errs.map((e) => e.message).join("; ") });
    }
    const list = result?.data?.metafieldsSet?.metafields ?? [];
    res.json({ success: true, metafields: list });
  } catch (err) {
    res.status(500).json({ error: err.message || "Metafield set failed" });
  }
});

router.post("/metafields/delete", requireAuthWithCustomer, async (req, res) => {
  try {
    const { metafieldId } = req.body;
    const gid = parseMetafieldGid(metafieldId);
    if (!gid) {
      return res.status(400).json({ error: "metafieldId must be GID format: gid://shopify/Metafield/{id}" });
    }
    const getResult = await adminGraphQL(
      `query getMetafield($id: ID!) {
        metafield(id: $id) {
          id
          ownerId
        }
      }`,
      { id: gid }
    );
    const metafield = getResult?.data?.metafield;
    if (!metafield) {
      return res.status(404).json({ error: "Metafield not found" });
    }
    if (metafield.ownerId !== req.customerId) {
      return res.status(403).json({ error: "Forbidden: cannot delete another customer's metafield" });
    }
    const result = await adminGraphQL(
      `mutation metafieldDelete($input: MetafieldDeleteInput!) {
        metafieldDelete(input: $input) {
          deletedId
          userErrors { field message }
        }
      }`,
      { input: { id: gid } }
    );
    const errs = result?.data?.metafieldDelete?.userErrors;
    if (errs?.length) {
      return res.status(400).json({ error: errs.map((e) => e.message).join("; ") });
    }
    const deletedId = result?.data?.metafieldDelete?.deletedId;
    res.json({ success: true, deletedId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Metafield delete failed" });
  }
});

export default router;
