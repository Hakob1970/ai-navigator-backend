const express = require("express");

const router = express.Router();

router.post("/create-checkout", async (req, res) => {
  try {

    const email = decodeURIComponent(
      String(req.body.email || "")
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "No email"
      });
    }

    return res.json({
      url: "https://buy.polar.sh/polar_cl_KAQ2nzn15fhbw9U0W8Hxjng6mlnK6vHjRcot80Rhmo9"
    });

  } catch (err) {

    console.error("POLAR ERROR:", err);

    return res.status(500).json({
      error: "Polar error"
    });
  }
});

module.exports = router;
