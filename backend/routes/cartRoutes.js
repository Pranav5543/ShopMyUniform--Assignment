const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cartController");

router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/", removeCartItem);
router.delete("/clear", clearCart);

module.exports = router;
