import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHotline extends Document {
  name: string;
  phoneNumber: string;
  extension?: string;
  department: string;
  description?: string;
  operatingHours: string;
  whatsappNumber?: string;
  emailAddress?: string;
  isEmergency: boolean;
  isPriority: boolean;
  isActive: boolean;
  displayOrder: number;
  callClickCount: number;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HotlineSchema = new Schema<IHotline>(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    extension: { type: String, trim: true },
    department: {
      type: String,
      required: true,
      enum: [
        "Executive Concierge",
        "Order Support",
        "VIP & High Value",
        "Technical & IT",
        "Billing & Refunds",
        "Seller Relations",
        "General Inquiries",
      ],
      default: "Order Support",
    },
    description: { type: String, default: "" },
    operatingHours: { type: String, default: "24/7 Round the Clock" },
    whatsappNumber: { type: String, trim: true },
    emailAddress: { type: String, lowercase: true, trim: true },
    isEmergency: { type: Boolean, default: false },
    isPriority: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    callClickCount: { type: Number, default: 0 },
    createdBy: { type: String, default: "System Admin" },
    lastModifiedBy: { type: String },
  },
  { timestamps: true }
);

export const Hotline: Model<IHotline> =
  (mongoose.models.Hotline as Model<IHotline>) ||
  mongoose.model<IHotline>("Hotline", HotlineSchema);

export interface ITicketReply {
  id: string;
  authorType: "staff" | "customer";
  authorName: string;
  authorEmail: string;
  message: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  isInternalNote: boolean;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerId?: string;
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status:
    | "New"
    | "Open"
    | "In Progress"
    | "Waiting for Customer"
    | "Escalated"
    | "Resolved"
    | "Closed";
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedDepartment: string;
  replies: ITicketReply[];
  tags: string[];
  csatRating?: number;
  csatFeedback?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  slaDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketReplySchema = new Schema(
  {
    id: { type: String, required: true },
    authorType: { type: String, enum: ["staff", "customer"], required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    message: { type: String, required: true },
    attachments: [
      {
        name: String,
        url: String,
        size: Number,
        mimeType: String,
      },
    ],
    isInternalNote: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, trim: true },
    customerId: { type: String },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Order Tracking",
        "Payment & Billing",
        "Refund & Return",
        "Defective / Damaged Product",
        "Account & Security",
        "Seller Complaint",
        "General Inquiry",
      ],
      default: "Order Tracking",
    },
    subcategory: { type: String },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "New",
        "Open",
        "In Progress",
        "Waiting for Customer",
        "Escalated",
        "Resolved",
        "Closed",
      ],
      default: "New",
      index: true,
    },
    assignedAgentId: { type: String },
    assignedAgentName: { type: String },
    assignedDepartment: { type: String, default: "Order Support" },
    replies: [TicketReplySchema],
    tags: [{ type: String }],
    csatRating: { type: Number, min: 1, max: 5 },
    csatFeedback: { type: String },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    slaDeadline: { type: Date },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ createdAt: -1 });

export const SupportTicket: Model<ISupportTicket> =
  (mongoose.models.SupportTicket as Model<ISupportTicket>) ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

export const Ticket = SupportTicket;

export interface IKnowledgeArticle extends Document {
  title: string;
  category: string;
  summary: string;
  content: string;
  status: "published" | "draft" | "archived";
  viewsCount: number;
  helpfulCount: number;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Orders & Delivery",
        "Payments & Refunds",
        "Account & Security",
        "Seller Guidelines",
        "Returns Policy",
        "Troubleshooting",
      ],
      default: "Orders & Delivery",
    },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
    },
    viewsCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    author: { type: String, default: "Editorial Support" },
  },
  { timestamps: true }
);

export const KnowledgeArticle: Model<IKnowledgeArticle> =
  (mongoose.models.KnowledgeArticle as Model<IKnowledgeArticle>) ||
  mongoose.model<IKnowledgeArticle>("KnowledgeArticle", KnowledgeArticleSchema);

export interface ISupportAgent extends Document {
  name: string;
  email: string;
  role: "Support Agent" | "Support Manager" | "Head of Care" | "Admin";
  department: string;
  status: "Active" | "Away" | "Offline";
  assignedTicketsCount: number;
  resolvedTicketsCount: number;
  avgCsat: number;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportAgentSchema = new Schema<ISupportAgent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: {
      type: String,
      enum: ["Support Agent", "Support Manager", "Head of Care", "Admin"],
      default: "Support Agent",
    },
    department: { type: String, default: "Order Support" },
    status: { type: String, enum: ["Active", "Away", "Offline"], default: "Active" },
    assignedTicketsCount: { type: Number, default: 0 },
    resolvedTicketsCount: { type: Number, default: 0 },
    avgCsat: { type: Number, default: 5.0 },
    phone: { type: String },
  },
  { timestamps: true }
);

export const SupportAgent: Model<ISupportAgent> =
  (mongoose.models.SupportAgent as Model<ISupportAgent>) ||
  mongoose.model<ISupportAgent>("SupportAgent", SupportAgentSchema);

export interface ICustomerCareAuditLog extends Document {
  action: string;
  targetId: string;
  targetType: "hotline" | "ticket" | "agent" | "faq" | "settings";
  performedBy: string;
  details: string;
  ip: string;
  createdAt: Date;
}

const CustomerCareAuditLogSchema = new Schema<ICustomerCareAuditLog>(
  {
    action: { type: String, required: true },
    targetId: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["hotline", "ticket", "agent", "faq", "settings"],
      required: true,
    },
    performedBy: { type: String, required: true },
    details: { type: String, default: "" },
    ip: { type: String, default: "127.0.0.1" },
  },
  { timestamps: true }
);

export const CustomerCareAuditLog: Model<ICustomerCareAuditLog> =
  (mongoose.models.CustomerCareAuditLog as Model<ICustomerCareAuditLog>) ||
  mongoose.model<ICustomerCareAuditLog>("CustomerCareAuditLog", CustomerCareAuditLogSchema);
