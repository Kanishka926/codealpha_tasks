const mongoose = require("mongoose");

// Cart schema - stores items for a logged-in user
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
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
    min: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
