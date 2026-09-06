const mongoose = require("mongoose");

// Stores structured policy content (delivery, returns/exchange, etc.)
// so the AI agent retrieves this from MongoDB instead of hardcoding it in prompts.
const policySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "delivery", "returns"
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
