const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const childProfileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    grade: { type: String, trim: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
    phone: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    rollNumber: { type: Number, min: 1, max: 60 },
    grade: { type: String, enum: ["6","7","8","9","10"], trim: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    children: [childProfileSchema],
    addresses: [addressSchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
