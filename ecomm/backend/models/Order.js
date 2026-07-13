const mongoose = require("mongoose");

// Order schema - stores placed orders
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  name: String,
  brand: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  image: String,
  color: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "",
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "cod"],
      default: "cod",
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "shipped", "delivered", "cancelled"],
      default: "confirmed",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
