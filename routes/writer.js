const express = require("express");
const router = express.Router();

const writerController = require("../controllers/writerController");

// =========================
// GENERATE ROUTE
// =========================
router.post("/generate", writerController.generate);

module.exports = router;
