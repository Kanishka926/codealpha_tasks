const Order = require("../models/Order");
const Cart = require("../models/Cart");

// POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const { name, phone, address, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate totals
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryCharges = total > 500 ? 0 : 50;

    // Set delivery date (7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product,
        name: item.name,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        discount: item.discount,
        image: item.image,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      })),
      total,
      deliveryCharges,
      paymentMethod: paymentMethod || "cod",
      name,
      phone,
      address,
      deliveryDate,
    });

    // Clear the cart after successful order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      orderDate: -1,
    });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
