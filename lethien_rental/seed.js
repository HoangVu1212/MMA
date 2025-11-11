const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/userModel");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await User.deleteMany(); // Xóa dữ liệu cũ cho sạch

    const adminPassword = await bcrypt.hash("123456", 10);
    const customerPassword = await bcrypt.hash("123456", 10);

    await User.insertMany([
      { username: "admin1", password: adminPassword, role: "admin" },
      { username: "user1", password: customerPassword, role: "customer" },
    ]);

    console.log("✅ Sample accounts created successfully!");
    console.log("👤 admin1 / 123456 (admin)");
    console.log("👤 user1 / 123456 (customer)");

    process.exit();
  })
  .catch((err) => console.error("❌ Seed error:", err));
