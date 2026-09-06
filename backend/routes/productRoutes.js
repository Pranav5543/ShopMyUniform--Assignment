const express = require("express");
const router = express.Router();
const { listProducts, getProduct, createProduct, updateProduct } = require("../controllers/productController");

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);

module.exports = router;
