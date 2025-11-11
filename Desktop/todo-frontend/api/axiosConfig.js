import axios from "axios";

// ⚙️ Dùng IP thật của máy bạn (IPv4 từ ipconfig)
const instance = axios.create({
  baseURL: "http://192.168.10.1:5000/api",
  timeout: 5000,
});

// 🧪 Test kết nối backend
instance
  .get("/test")
  .then((res) => console.log("✅ Expo gọi được backend:", res.data))
  .catch((err) => console.log("❌ Không gọi được backend:", err.message));

export default instance;
