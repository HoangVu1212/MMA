/**
 * Script để cập nhật địa chỉ cho các user cũ trong database
 * Chạy script này một lần để đảm bảo tất cả user đều có field address
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const updateUserAddresses = async () => {
  try {
    // Kết nối đến MongoDB (sử dụng URI giống trong server.js)
    await mongoose.connect("mongodb://127.0.0.1:27017/perfumeStore", {});

    console.log("✅ Đã kết nối đến MongoDB");

    // Tìm tất cả user không có address hoặc address là null/undefined
    const usersWithoutAddress = await User.find({
      $or: [
        { address: { $exists: false } },
        { address: null },
        { address: "" }
      ]
    });

    console.log(`\n📊 Tìm thấy ${usersWithoutAddress.length} user không có địa chỉ`);

    if (usersWithoutAddress.length === 0) {
      console.log("✅ Tất cả user đều đã có địa chỉ hoặc field address");
      await mongoose.connection.close();
      return;
    }

    // Cập nhật address thành chuỗi rỗng cho các user này
    const result = await User.updateMany(
      {
        $or: [
          { address: { $exists: false } },
          { address: null }
        ]
      },
      {
        $set: { address: "" }
      }
    );

    console.log(`\n✅ Đã cập nhật ${result.modifiedCount} user`);
    
    // Hiển thị danh sách user đã cập nhật
    console.log("\n📋 Danh sách user đã cập nhật:");
    usersWithoutAddress.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });

    console.log("\n✅ Hoàn tất! Bây giờ tất cả user đều có field address");

    await mongoose.connection.close();
    console.log("\n👋 Đã ngắt kết nối MongoDB");

  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    process.exit(1);
  }
};

// Chạy script
updateUserAddresses();

