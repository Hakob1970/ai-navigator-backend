const express = require("express");
const router = express.Router();

const writerController = require("../controllers/writerController");

// =========================
// OLD GENERATE
// =========================
router.post("/generate", writerController.generate);


// =========================
// WRITER STUDIO ENGINE
// =========================
router.post("/generateBook", writerController.generateBook);

router.post("/analyzeManuscript", writerController.analyzeManuscript);


module.exports = router;
