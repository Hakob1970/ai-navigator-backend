const express = require("express");
const axios = require("axios");

const router = express.Router();

// =========================
// CREEM CHECKOUT
// =========================
router.post("/create-checkout", async (req, res) => {
  try {
    const email = decodeURIComponent(
      String(req.body.email || "")
    )
      .trim()
      .toLowerCase();
    console.log("ENV CHECK:", {
  key: process.env.CREEM_API_KEY,
  product: process.env.CREEM_PRODUCT_ID
});

    console.log("CREEM KEY:", process.env.CREEM_API_KEY);
console.log("PRODUCT:", process.env.CREEM_PRODUCT_ID);
console.log("EMAIL:", email);

    if (!email) {
      return res.status(400).json({ error: "No email" });
    }

    const response = await axios.post(
      "https://api.creem.io/v1/checkouts",
      {
        product_id: process.env.CREEM_PRODUCT_ID,
        customer: {
          email: email
        }
      },
      {
        headers: {
          "x-api-key": process.env.CREEM_API_KEY,
        },
      }
    );

    return res.json({
      url: response.data.checkout_url
    });

  } catch (err) {
  console.error("CREEM ERROR STATUS:", err?.response?.status);
  console.error("CREEM ERROR DATA:", err?.response?.data);
  console.error("CREEM ERROR MESSAGE:", err.message);

  return res.status(500).json({
    error: "Creem error",
    details: err?.response?.data || err.message
  });
}
});

module.exports = router;
