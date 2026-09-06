const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    city: { type: String, trim: true },
    grades: [{ type: String }], // e.g. ["Nursery","1","2",...,"12"]
    logoUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", schoolSchema);
