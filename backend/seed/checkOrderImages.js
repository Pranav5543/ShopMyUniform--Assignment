// Quick script to check what the order API returns for item images
const mongoose = require("mongoose");
require("dotenv").config();

const Order = require("../models/Order");
const Product = require("../models/Product");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Get a recent order
  const order = await Order.findOne().sort({ createdAt: -1 }).populate("items.product");
  
  if (!order) {
    console.log("No orders found");
    process.exit(0);
  }

  console.log("Order:", order.orderNumber);
  for (const item of order.items) {
    console.log("\n--- Item:", item.name, "---");
    console.log("item.image:", item.image || "(empty)");
    console.log("item.product type:", typeof item.product);
    if (item.product && typeof item.product === "object") {
      console.log("item.product.images:", item.product.images);
    } else {
      console.log("item.product (raw ID):", item.product);
      // Manually fetch
      const prod = await Product.findById(item.product);
      console.log("Product images from DB:", prod ? prod.images : "PRODUCT NOT FOUND");
    }
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
