require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_ATLAS_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
