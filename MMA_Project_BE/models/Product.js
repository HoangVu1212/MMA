const mongoose = require("mongoose");

const perfumeSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true, // Đảm bảo id là duy nhất
    },
    name: {
      type: String,
      required: true,
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    scent: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Giá không được âm
    },
    stock: {
      type: Number,
      required: true,
      min: 0, // Tồn kho không được âm
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, // Số lượng không được âm
    },
    image: {
      type: String,
      required: true,
      trim: true,
      match: /^https?:\/\/.+$/, // Kiểm tra định dạng URL
    },
    ingredients: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    volume: {
      type: String,
      required: true,
      trim: true,
    },
    concentration: {
      type: String,
      required: true,
      trim: true,
    },
    madeIn: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Tạo model từ schema
const Perfume = mongoose.model("Product", perfumeSchema);

module.exports = Perfume;
