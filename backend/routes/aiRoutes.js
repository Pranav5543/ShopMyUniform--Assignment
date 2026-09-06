const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth");
const { chat } = require("../controllers/aiController");

router.post("/chat", optionalAuth, chat);

module.exports = router;
