# nguyenthanhson_laptoporder

Laptop Order Management System (Node.js + Express + Mongoose + JWT)

## Setup

1. Copy `.env.example` to `.env` and update values if needed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server (development):
   ```bash
   npm run dev
   ```
   or production:
   ```bash
   npm start
   ```

## API Endpoints (basic)

- POST /auth/register  -> { username, password }
- POST /auth/login     -> { username, password } returns { token }
- GET  /users          -> (protected) list users
- DELETE /users/:id    -> (protected) delete user (fails if user has orders)
- POST /laptops        -> create laptop (protected)
- GET  /laptops        -> list laptops (protected)
- POST /orders         -> create order (protected) body: { laptopId, quantity }
- GET  /orders         -> list orders (protected)

Protected endpoints require header:
Authorization: Bearer <token>
