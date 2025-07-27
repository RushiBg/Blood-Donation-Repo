const express = require("express");
const router = express.Router();
const { sendCode, confirmCode } = require("../controllers/verifyController");

router.post("/send", sendCode);
router.post("/confirm", confirmCode);

module.exports = router; 