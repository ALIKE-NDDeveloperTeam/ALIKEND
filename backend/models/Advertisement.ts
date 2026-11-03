import mongoose, { Schema, Document } from "mongoose";

export interface IAdvertisement extends Document {
  id?: string | number;
  title: string;
  subtitle?: string;
  tagline?: string;
  badge?: string;
  imageUrl: string;
  destinationUrl: string;
  buttonText?: string;
  position: string; // 'hero_sub_left', 'hero_sub_right', 'mid_promo', 'category_sponsor', 'footer_promo'
  startDate?: string;
  endDate?: string;
  active: boolean;
  order: number;
  clickCount?: number;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    tagline: { type: String, default: "", trim: true },
    badge: { type: String, default: "EXCLUSIVE", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    destinationUrl: { type: String, required: true, trim: true },
    buttonText: { type: String, default: "Explore Now", trim: true },
    position: { type: String, default: "mid_promo", trim: true },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    active: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 1 },
    clickCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "advertisements" }
);

export default mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);
