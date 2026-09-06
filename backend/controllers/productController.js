const Product = require("../models/Product");

// GET /api/products?school=&category=&grade=&search=&gender=&page=&limit=
exports.listProducts = async (req, res) => {
  try {
    const { school, category, grade, search, gender, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (school) filter.school = school;
    if (category) filter.category = category;
    if (grade) filter.gradeLevels = grade;
    if (gender) filter.gender = gender;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate("school", "name").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("school", "name");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
};

// POST /api/products (admin utility)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: "Could not create product", error: err.message });
  }
};

// PUT /api/products/:id (admin utility)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: "Could not update product", error: err.message });
  }
};
