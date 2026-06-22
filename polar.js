const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/create-checkout", async (req, res) => {

  console.log("🔥 POLAR.JS CREATE-CHECKOUT");
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const module = String(req.body.module || "");

    if (!email) {
      return res.status(400).json({ error: "No email" });
    }

    if (!module) {
      return res.status(400).json({ error: "No module" });
    }

    console.log("🚀 POLAR CHECKOUT START");
    console.log("EMAIL:", email);
    console.log("MODULE:", module);

    // =========================
    // PRODUCTS
    // =========================

  const PRODUCT_IDS = {
  "ai-navigator": process.env.POLAR_PRODUCT_ID,

  "auto-mechanic":
    process.env.POLAR_AUTO_MECHANIC_PRODUCT_ID
};


    const productId = PRODUCT_IDS[module];

    if (!productId) {
      return res.status(400).json({
        error: "Invalid module"
      });
    }

    // =========================
    // CREATE CHECKOUT
    // =========================

   const response = await axios.post(
  "https://api.polar.sh/v1/checkouts",
  {
    products: [productId],   // ✅ FIX

    success_url: process.env.POLAR_SUCCESS_URL,

    metadata: {
      email,
      module
    }
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    }
  }
);

    console.log("✅ POLAR SUCCESS");

    console.log("💳 CHECKOUT CREATED", {
      provider: "polar",
      email,
      module,
      productId,
      time: Date.now()
    });

    return res.json({
      url: response.data.url
    });

  } catch (err) {
    console.error("❌ POLAR ERROR:");

    console.error(err?.response?.status);

    console.error(
      err?.response?.data || err.message
    );

    return res.status(500).json({
      error: "Polar checkout failed"
    });
  }
});

module.exports = router;
