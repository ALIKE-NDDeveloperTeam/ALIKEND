import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  titleEn: string;
  titleBn: string;
  imageUrl: string;
  badgeText?: string;
  badgeColor?: string;
  redirectUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    titleEn: {
      type: String,
      required: [true, "English title is required"],
      trim: true,
    },
    titleBn: {
      type: String,
      required: [true, "Bengali title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    badgeText: {
      type: String,
      trim: true,
      default: "",
    },
    badgeColor: {
      type: String,
      trim: true,
      default: "#F5A623",
    },
    redirectUrl: {
      type: String,
      required: [true, "Redirect link is required"],
      trim: true,
      default: "category_search",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient ordering
CategorySchema.index({ order: 1, createdAt: 1 });
CategorySchema.index({ isActive: 1 });

const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema, "categories");

export default Category;
