const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/create-checkout", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "No email" });
    }

    const response = await axios.post(
      "https://api.polar.sh/v1/checkouts",
      {
        success_url: process.env.POLAR_SUCCESS_URL,
        metadata: {
          email
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      url: response.data.url
    });

  } catch (err) {
    console.error("POLAR ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      error: "Polar checkout failed"
    });
  }
});

module.exports = router;
