npm i
npm install express mongoose bcryptjs jsonwebtoken dotenv cors morgan cookie-parser method-override --save-dev nodemon
node seed.js
npm start
Đăng ký tài khoản (Register) :
POST : http://localhost:5000/auth/register
Body (JSON) :
{
"username": "user",
"password": "123456"
}
Đăng nhập (Login) :
POST : http://localhost:5000/auth/login
Body (JSON) :
{
"username": "admin1",
"password": "123456"
}
Nhận lại token JWT :
{
"token": "eyJhbGciOiJIUzI1NiIs...",
"role": "admin"
}

Lấy danh sách tất cả người dùng (Admin):
GET : http://localhost:5000/users
Xóa người dùng (Admin):
DELETE : http://localhost:5000/users/:id

Tạo equipment (Admin):
POST : http://localhost:5000/equipment
Body (JSON):
{
"name": "Canon R50",
"category": "camera",
"pricePerDay": 15,
"depositFee": 50,
"stockQuantity": 5
}

Tất cả equiptment (All equiptment):
GET : http://localhost:5000/equipment

Đăng nhập (Login) :
POST : http://localhost:5000/auth/login
Body (JSON) :
{
"username": "user1",
"password": "123456"
}
Tất cả bãi đỗ xe (All Parking Lots):
GET : http://localhost:5000/equipment

Đặt thue (Customer) :
POST : http://localhost:5000/rentals
Body (JSON) :
{
"equipmentID": "64f72b7b1bacd24b72ab6d0",
"startDate": "2025-07-01T08:00:00",
"quantity": 1
}
Kết thúc phiên thue
PATCH : http://localhost:5000/rentals/:id/end

Danh sách tất cả rental:
GET : http://localhost:5000/rentals
Tìm vé theo ngày (Search Tickets by Date) :
GET : http://localhost:5000/rentalss/search/date?start=2025-07-01&end=2025-07-31
