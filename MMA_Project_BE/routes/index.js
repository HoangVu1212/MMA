const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const productRouter = require("./productRouter");

router.use("/auth", authRouter);
router.use("/product", productRouter);

module.exports = router;
