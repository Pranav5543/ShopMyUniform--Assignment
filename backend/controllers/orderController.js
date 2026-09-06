const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const generateOrderNumber = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SMU${ts}${rand}`;
};

// POST /api/orders  { shippingAddress, paymentMethod }
// Creates an order from the user's current cart (basic checkout).
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body;
    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: "A complete shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const orderItems = [];
    let itemsTotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      const sizeEntry = product.sizes.find((s) => s.size === item.size);
      if (!sizeEntry || sizeEntry.stock < item.quantity) {
        return res.status(400).json({
          message: `"${product.name}" (size ${item.size}) no longer has enough stock`,
        });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : "",
        size: item.size,
        quantity: item.quantity,
        price: product.price,
      });
      itemsTotal += product.price * item.quantity;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "No valid items to order" });
    }

    // Decrement stock
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": -item.quantity } }
      );
    }

    const shippingFee = itemsTotal >= 999 ? 0 : 49;
    const totalAmount = itemsTotal + shippingFee;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingFee,
      totalAmount,
      status: "Placed",
      statusHistory: [{ status: "Placed", note: "Order placed successfully" }],
      estimatedDeliveryDate,
    });

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// GET /api/orders  (current user's orders)
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });
  res.json({ orders });
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to view this order" });
  }
  res.json({ order });
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  if (["Delivered", "Cancelled", "Returned"].includes(order.status)) {
    return res.status(400).json({ message: `Order cannot be cancelled once it is ${order.status}` });
  }
  order.status = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
  await order.save();
  res.json({ order });
};
