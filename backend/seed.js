// backend/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");

const menuItems = [
  {
    name: "Spring Rolls",
    description: "Crispy rolls",
    category: "Appetizer",
    price: 5,
    ingredients: ["Cabbage", "Carrot"],
    preparationTime: 10,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Chicken Wings",
    description: "Spicy wings",
    category: "Appetizer",
    price: 8,
    ingredients: ["Chicken", "Spices"],
    preparationTime: 15,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Caesar Salad",
    description: "Classic salad",
    category: "Appetizer",
    price: 7,
    ingredients: ["Lettuce", "Croutons"],
    preparationTime: 8,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Margherita Pizza",
    description: "Cheese pizza",
    category: "Main Course",
    price: 12,
    ingredients: ["Cheese", "Tomato"],
    preparationTime: 20,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Veg Burger",
    description: "Loaded veg burger",
    category: "Main Course",
    price: 10,
    ingredients: ["Bun", "Patty"],
    preparationTime: 12,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Grilled Chicken",
    description: "Juicy grilled chicken",
    category: "Main Course",
    price: 15,
    ingredients: ["Chicken", "Spices"],
    preparationTime: 25,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Pasta Alfredo",
    description: "Creamy pasta",
    category: "Main Course",
    price: 13,
    ingredients: ["Pasta", "Cream"],
    preparationTime: 18,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Paneer Tikka",
    description: "Spicy paneer",
    category: "Main Course",
    price: 11,
    ingredients: ["Paneer", "Spices"],
    preparationTime: 15,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Brownie",
    description: "Chocolate dessert",
    category: "Dessert",
    price: 6,
    ingredients: ["Chocolate", "Flour"],
    preparationTime: 10,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Ice Cream",
    description: "Vanilla scoop",
    category: "Dessert",
    price: 4,
    ingredients: ["Milk", "Sugar"],
    preparationTime: 5,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Gulab Jamun",
    description: "Indian sweet",
    category: "Dessert",
    price: 5,
    ingredients: ["Milk", "Sugar"],
    preparationTime: 8,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Lemonade",
    description: "Fresh drink",
    category: "Beverage",
    price: 3,
    ingredients: ["Lemon", "Sugar"],
    preparationTime: 3,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Mojito",
    description: "Minty drink",
    category: "Beverage",
    price: 4,
    ingredients: ["Mint", "Lime"],
    preparationTime: 4,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Coffee",
    description: "Hot coffee",
    category: "Beverage",
    price: 3,
    ingredients: ["Coffee", "Milk"],
    preparationTime: 5,
    imageUrl: "",
    isAvailable: true,
  },
  {
    name: "Orange Juice",
    description: "Fresh juice",
    category: "Beverage",
    price: 4,
    ingredients: ["Orange"],
    preparationTime: 4,
    imageUrl: "",
    isAvailable: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_ATLAS_URI);
  await MenuItem.deleteMany();
  await Order.deleteMany();
  const createdMenu = await MenuItem.insertMany(menuItems);
  // Ensure text index exists for search
  await MenuItem.collection.createIndex({ name: "text", ingredients: "text" });

  // Create 10 sample orders
  const statuses = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];
  const orders = [];
  for (let i = 0; i < 10; i++) {
    const items = [
      {
        menuItem:
          createdMenu[Math.floor(Math.random() * createdMenu.length)]._id,
        quantity: Math.ceil(Math.random() * 3),
        price:
          createdMenu[Math.floor(Math.random() * createdMenu.length)].price,
      },
      {
        menuItem:
          createdMenu[Math.floor(Math.random() * createdMenu.length)]._id,
        quantity: Math.ceil(Math.random() * 2),
        price:
          createdMenu[Math.floor(Math.random() * createdMenu.length)].price,
      },
    ];
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    orders.push({
      orderNumber: `ORD-${Date.now()}-${i}`,
      items,
      totalAmount,
      status: statuses[i % statuses.length],
      customerName: `Customer ${i + 1}`,
      tableNumber: (i % 5) + 1,
    });
  }
  await Order.insertMany(orders);
  console.log("Database seeded!");
  mongoose.disconnect();
}

seed();
