import mongoose, { Schema, Document } from "mongoose";

export interface IFlashSaleProduct {
  productId: string | number;
  flashPrice?: number;
  discountPercent?: number;
  isFeatured?: boolean;
  order?: number;
}

export interface IFlashSaleConfig extends Document {
  title: string;
  subtitle: string;
  bannerText: string;
  targetEndTime: Date;
  activeProducts: IFlashSaleProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const FlashSaleSchema = new Schema<IFlashSaleConfig>(
  {
    title: { type: String, default: "FLASH PREMIUM HOURS" },
    subtitle: { type: String, default: "Uncompromised pricing on luxury gear" },
    bannerText: { type: String, default: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!" },
    targetEndTime: { type: Date, required: true },
    activeProducts: [
      {
        productId: { type: Schema.Types.Mixed, required: true },
        flashPrice: { type: Number },
        discountPercent: { type: Number },
        isFeatured: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.FlashSale || mongoose.model<IFlashSaleConfig>("FlashSale", FlashSaleSchema);
