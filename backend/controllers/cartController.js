const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// GET /api/cart
exports.getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.product");
  res.json({ cart });
};

// POST /api/cart  { productId, size, quantity }
exports.addToCart = async (req, res) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const sizeEntry = product.sizes.find((s) => s.size === size);
    if (!sizeEntry) return res.status(400).json({ message: `Size ${size} not available for this product` });
    if (sizeEntry.stock < quantity) return res.status(400).json({ message: "Insufficient stock for selected size" });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.product.toString() === productId && i.size === size);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, size, quantity });
    }
    await cart.save();
    await cart.populate("items.product");
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
};

// PUT /api/cart  { productId, size, quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === productId && i.size === size);
    if (!item) return res.status(404).json({ message: "Item not in cart" });
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => !(i.product.toString() === productId && i.size === size));
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    await cart.populate("items.product");
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart", error: err.message });
  }
};

// DELETE /api/cart  { productId, size }
exports.removeCartItem = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => !(i.product.toString() === productId && i.size === size));
    await cart.save();
    await cart.populate("items.product");
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item", error: err.message });
  }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ cart });
};
