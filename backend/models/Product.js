const mongoose = require("mongoose");

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, // e.g. "26", "S", "M"
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["shirt", "pant", "skirt", "tie", "sweater", "shoes", "sports-kit", "accessory"],
      required: true,
    },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    gradeLevels: [{ type: String }], // grades this product applies to
    gender: { type: String, enum: ["boy", "girl", "unisex"], default: "unisex" },
    color: { type: String, default: "" },
    price: { type: Number, required: true },
    images: [{ type: String }],
    sizes: [sizeStockSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", color: "text" });

module.exports = mongoose.model("Product", productSchema);
