# ALIKE ND — Admin Backend (MongoDB + Express)

## 1. Install dependencies
```
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install -D @types/express @types/bcryptjs @types/jsonwebtoken @types/cors
```

## 2. Add to your `.env`
```
MONGO_URI=mongodb://127.0.0.1:27017/alikend
JWT_SECRET=replace-with-a-long-random-string
```
If you're using MongoDB Atlas instead of a local database, paste the Atlas
connection string as MONGO_URI.

## 3. Wire the routes into your existing `server.ts`
Add near the top:
```ts
import mongoose from "mongoose";
import authRoutes from "./backend/routes/auth";
import productRoutes from "./backend/routes/products";
import orderRoutes from "./backend/routes/orders";
import sellerRoutes from "./backend/routes/sellers";
import customerRoutes from "./backend/routes/customers";

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}
```
Then, wherever you register routes on your `app`:
```ts
app.use("/api/admin", authRoutes);          // POST /api/admin/login
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/sellers", sellerRoutes);
app.use("/api/admin/customers", customerRoutes);
```
Also make sure `express.json()` and `cors()` middleware are enabled before these.

## 4. Create your first admin login + sample data
```
npx ts-node backend/seed.ts
```
This creates login `admin@alikend.com` / `admin123` — change the password
after your first login (there's no "change password" endpoint yet, so for now
update it directly via seed.ts or a DB tool, then re-run once).

## API summary
| Method | Path                          | Auth | Purpose               |
|--------|-------------------------------|------|------------------------|
| POST   | /api/admin/login              | no   | returns JWT token      |
| GET    | /api/admin/products           | yes  | list products          |
| POST   | /api/admin/products           | yes  | create product         |
| PUT    | /api/admin/products/:id       | yes  | update product         |
| DELETE | /api/admin/products/:id       | yes  | delete product         |
| GET    | /api/admin/orders             | yes  | list orders            |
| PATCH  | /api/admin/orders/:id/status  | yes  | update order status    |
| GET    | /api/admin/sellers            | yes  | list sellers           |
| PATCH  | /api/admin/sellers/:id/status | yes  | approve/suspend seller |
| GET    | /api/admin/customers          | yes  | list VIP members       |

All `yes`-auth routes need header: `Authorization: Bearer <token>` (the token
returned from /login).
