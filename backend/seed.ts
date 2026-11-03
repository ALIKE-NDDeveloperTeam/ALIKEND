/**
 * Run once to create your first admin login and some sample data.
 * Usage:  npx ts-node backend/seed.ts
 * (make sure MONGO_URI is set in your .env first)
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin";
import Product from "./models/Product";
import Order from "./models/Order";
import Seller from "./models/Seller";
import Customer from "./models/Customer";

dotenv.config();

export async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in .env");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // --- admin users (Master Super Admin & Regular Staff Admin) ---
  const seedPassword = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_SEED_PASSWORD;
  const superAdminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() || "developer.alikend@gmail.com";
  const superAdminName = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";
  const staffAdminEmail = process.env.STAFF_ADMIN_EMAIL?.trim().toLowerCase() || "admin234@gmail.com";

  const adminsToSeed: Array<{ email: string; name: string; role: "superadmin" | "admin" }> = [
    { email: superAdminEmail, name: superAdminName, role: "superadmin" },
    { email: staffAdminEmail, name: "Regular Staff Admin", role: "admin" },
  ];

  for (const adm of adminsToSeed) {
    const existing = await Admin.findOne({ email: adm.email });
    if (!existing) {
      if (!seedPassword) {
        console.warn(`⚠️ [SEED] Skipped creating admin ${adm.email}: INITIAL_ADMIN_PASSWORD environment variable is not set.`);
        continue;
      }
      const passwordHash = await bcrypt.hash(seedPassword, 10);
      await Admin.create({ email: adm.email, passwordHash, name: adm.name, role: adm.role });
      console.log(`Created admin login: ${adm.email} (${adm.role})`);
    } else {
      console.log(`Admin ${adm.email} already exists with stored passwordHash. Preserving existing credentials.`);
      existing.name = adm.name;
      existing.role = adm.role as any;
      await existing.save();
    }
  }

  // --- sample data (only if collections are empty) ---
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany([
      { name: "Chronograph Steel Watch", category: "Watches", price: 1250, stock: 14, emoji: "⌚", audience: "men" },
      { name: "Quilted Leather Handbag", category: "Handbags", price: 2400, stock: 6, emoji: "👜", audience: "women" },
      { name: "Cashmere Overcoat", category: "Apparel", price: 980, stock: 1, emoji: "🧥", audience: "unisex" },
    ]);
    console.log("Seeded sample products");
  }

  if ((await Seller.countDocuments()) === 0) {
    await Seller.insertMany([
      { storefront: "Maison Argent", ownerName: "Sara Whitfield", ownerEmail: "sara@example.com", listingsCount: 34, status: "approved" },
      { storefront: "Noir & Gold", ownerName: "Daniel Cho", ownerEmail: "daniel@example.com", listingsCount: 12, status: "review" },
    ]);
    console.log("Seeded sample sellers");
  }

  if ((await Customer.countDocuments()) === 0) {
    await Customer.insertMany([
      { name: "Vikram Malhotra", email: "vikram@example.com", tier: "Platinum", ordersCount: 14, lifetimeSpend: 28400 },
      { name: "Amara Okafor", email: "amara@example.com", tier: "Silver", ordersCount: 3, lifetimeSpend: 3120 },
    ]);
    console.log("Seeded sample customers");
  }

  if ((await Order.countDocuments()) === 0) {
    await Order.insertMany([
      { orderNumber: "AN-5201", memberName: "Vikram Malhotra", total: 2400, status: "pending" },
      { orderNumber: "AN-5200", memberName: "Sara Whitfield", total: 1250, status: "shipped" },
    ]);
    console.log("Seeded sample orders");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

// Only run immediately if executed directly via CLI
if (process.argv[1]?.includes("seed")) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
