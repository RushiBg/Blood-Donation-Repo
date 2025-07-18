const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/userController");

router.post("/", register);
router.post("/login", login);

module.exports = router; 