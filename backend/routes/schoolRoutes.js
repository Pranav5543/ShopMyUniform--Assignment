const express = require("express");
const router = express.Router();
const { listSchools, getSchool, createSchool } = require("../controllers/schoolController");

router.get("/", listSchools);
router.get("/:id", getSchool);
router.post("/", createSchool);

module.exports = router;
