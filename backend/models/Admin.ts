import mongoose, { Schema, Document, Model } from "mongoose";

export type AdminRole =
  | "superadmin"      // হেড এডমিন (Head Admin / Super Admin)
  | "main_admin"       // মেইন এডমিন (Main Admin)
  | "sub_admin"        // সাব এডমিন (Sub Admin)
  | "user_admin"       // ইউজার এডমিন (User Admin)
  | "order_admin"      // অর্ডার ও ডেলিভারি এডমিন (Order Admin)
  | "catalog_admin"    // প্রোডাক্ট ও ক্যাটালগ এডমিন (Catalog Admin)
  | "seller_admin"     // সেলার ও ভেন্ডর এডমিন (Seller Admin)
  | "finance_admin"    // ফাইন্যান্স ও কমিশন এডমিন (Finance Admin)
  | "support_admin"    // হেল্পডেস্ক ও সাপোর্ট এডমিন (Support Admin)
  | "admin";           // জেনারেল এডমিন (General Admin)

export interface AdminSellerPermissions {
  viewSellers: boolean;
  approveSellers: boolean;
  editSellerProfiles: boolean;
  suspendSellers: boolean;
  manageSellerProducts: boolean;
  viewSellerOrders: boolean;
  manageRefunds: boolean;
  viewFinancialReports: boolean;
  managePayouts: boolean;
  manageSellerSupport: boolean;
}

<<<<<<< HEAD
export type AdminSellerManagementPermissions = AdminSellerPermissions;

=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  phone?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  sellerManagementPermissions?: AdminSellerPermissions;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Super Admin" },
    role: {
      type: String,
      enum: [
        "superadmin",
        "main_admin",
        "sub_admin",
        "user_admin",
        "order_admin",
        "catalog_admin",
        "seller_admin",
        "finance_admin",
        "support_admin",
        "admin",
      ],
      default: "superadmin",
    },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    sellerManagementPermissions: {
      viewSellers: { type: Boolean, default: true },
      approveSellers: { type: Boolean, default: true },
      editSellerProfiles: { type: Boolean, default: true },
      suspendSellers: { type: Boolean, default: true },
      manageSellerProducts: { type: Boolean, default: true },
      viewSellerOrders: { type: Boolean, default: true },
      manageRefunds: { type: Boolean, default: true },
      viewFinancialReports: { type: Boolean, default: true },
      managePayouts: { type: Boolean, default: true },
      manageSellerSupport: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    collection: "admins",
  }
);

const Admin: Model<IAdmin> =
  (mongoose.models.Admin as Model<IAdmin>) || mongoose.model<IAdmin>("Admin", AdminSchema, "admins");
export default Admin;
