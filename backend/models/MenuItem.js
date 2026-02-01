// backend/models/MenuItem.js
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["Appetizer", "Main Course", "Dessert", "Beverage"],
    },
    price: { type: Number, required: true },
    ingredients: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

// Text index for search
menuItemSchema.index({ name: "text", ingredients: "text" });

module.exports = mongoose.model("MenuItem", menuItemSchema);
