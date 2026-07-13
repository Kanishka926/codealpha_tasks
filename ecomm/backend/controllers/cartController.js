const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      // Create empty cart if none exists
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, color, size } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product with same color/size already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === (color || "") &&
        item.size === (size || "")
    );

    if (existingItemIndex > -1) {
      // Increment quantity of existing item
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      // Add new item with product details
      cart.items.push({
        product: productId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image,
        color: color || "",
        size: size || "",
        quantity: quantity || 1,
      });
    }

    await cart.save();

    // Return updated cart with populated product data
    cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/update
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in cart
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/remove/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the item
    cart.items.pull(itemId);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};
