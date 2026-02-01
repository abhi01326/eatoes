// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Helper: generate unique order number
const generateOrderNumber = () =>
  "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

// GET /api/orders - Get all orders with pagination and status filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Order.countDocuments(filter);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id - Get single order with populated menu item details
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.menuItem",
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
  try {
    const { items, customerName, tableNumber } = req.body;
    let totalAmount = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem)
        return res.status(400).json({ error: "Invalid menu item" });
      item.price = menuItem.price;
      totalAmount += menuItem.price * item.quantity;
    }
    const order = new Order({
      orderNumber: generateOrderNumber(),
      items,
      totalAmount,
      customerName,
      tableNumber,
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
