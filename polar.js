const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/create-checkout", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const plan = String(req.body.plan || "premium"); 
    // "premium" | "7d"

    if (!email) {
      return res.status(400).json({ error: "No email" });
    }

    console.log("🚀 POLAR CHECKOUT START");
    console.log("EMAIL:", email);
    console.log("PLAN:", plan);

    // 🎯 выбор продукта
    let productId;

    if (plan === "7d") {
      productId = process.env.POLAR_PRODUCT_7D;
    } else {
      productId = process.env.POLAR_PRODUCT_ID; // premium
    }

    const response = await axios.post(
      "https://api.polar.sh/v1/checkouts",
      {
        product_id: productId,
        success_url: process.env.POLAR_SUCCESS_URL,
        metadata: {
          email,
          plan
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
    console.log("CHECKOUT RESPONSE:", response.data);

    return res.json({
      url: response.data.url
    });

  } catch (err) {
    console.error("❌ POLAR ERROR:");
    console.error(err?.response?.status);
    console.error(err?.response?.data);
    console.error(err.message);

    return res.status(500).json({
      error: "Polar checkout failed"
    });
  }
});

module.exports = router;
