const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
} = require("../controllers/categoryController");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

module.exports = router;
