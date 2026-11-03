import mongoose, { Schema, Document } from "mongoose";

export interface ISavedRidePlace extends Document {
  placeId: string;
  userId?: string;
  phone?: string;
  label: "home" | "work" | "airport" | "metro" | "favorite" | "other";
  customName: string;
  address: string;
  landmark?: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
}

const SavedRidePlaceSchema = new Schema<ISavedRidePlace>(
  {
    placeId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    phone: { type: String, index: true },
    label: {
      type: String,
      enum: ["home", "work", "airport", "metro", "favorite", "other"],
      default: "favorite",
    },
    customName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.209 },
  },
  {
    timestamps: true,
    collection: "saved_ride_places",
  }
);

export const SavedRidePlaceModel =
  mongoose.models.SavedRidePlace ||
  mongoose.model<ISavedRidePlace>("SavedRidePlace", SavedRidePlaceSchema);

export default SavedRidePlaceModel;
