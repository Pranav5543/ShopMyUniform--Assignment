const School = require("../models/School");

// GET /api/schools
exports.listSchools = async (req, res) => {
  const schools = await School.find().sort({ name: 1 });
  res.json({ schools });
};

// GET /api/schools/:id
exports.getSchool = async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) return res.status(404).json({ message: "School not found" });
  res.json({ school });
};

// POST /api/schools (admin utility, used mainly by seed script / admin tools)
exports.createSchool = async (req, res) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json({ school });
  } catch (err) {
    res.status(400).json({ message: "Could not create school", error: err.message });
  }
};
