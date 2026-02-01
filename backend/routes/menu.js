// backend/routes/menu.js
const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

// GET /api/menu - Get all menu items with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, isAvailable, minPrice, maxPrice } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const menuItems = await MenuItem.find(filter);
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu/search?q=query - Search menu items by name or ingredients (any word match)
router.get("/search", async (req, res) => {
  try {
    const { q, category, isAvailable } = req.query;
    if (!q) return res.json([]);
    // Split query into words, ignore empty
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length === 0) return res.json([]);
    // Build $or array for regex match on name or ingredients for any word
    const or = words
      .map((word) => [
        { name: { $regex: word, $options: "i" } },
        { ingredients: { $regex: word, $options: "i" } },
      ])
      .flat();
    // Only show results that match BOTH course and availability (if selected)
    const filter = { $or: or };
    if (category && category !== "All") filter.category = category;
    if (isAvailable && isAvailable !== "All")
      filter.isAvailable = isAvailable === "Available";
    // If a filter is set, require it to match (AND logic)
    const results = await MenuItem.find(filter);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu/:id - Get single menu item by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu - Create new menu item
router.post("/", async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/menu/:id - Update menu item
router.put("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/menu/:id - Delete menu item
router.delete("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/menu/:id/availability - Toggle availability status
router.patch("/:id/availability", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
