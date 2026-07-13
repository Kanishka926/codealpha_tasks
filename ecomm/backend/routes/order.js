const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

// All order routes require authentication
router.use(protect);

router.post("/", placeOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;
