import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBanner extends Document {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  link?: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  isActive?: boolean;
  isCenterFeatured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    imageUrl: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    buttonText: { type: String, default: "", trim: true },
    link: { type: String, default: "", trim: true },
    linkUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
    isCenterFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "banners" }
);

const Banner: Model<IBanner> =
  (mongoose.models.Banner as Model<IBanner>) ||
  mongoose.model<IBanner>("Banner", BannerSchema, "banners");

export default Banner;
