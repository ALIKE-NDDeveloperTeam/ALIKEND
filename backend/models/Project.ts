import mongoose, { Schema, Document } from "mongoose";

export interface IProjectDataEntry {
  key: string;
  value: any;
  type?: string;
  createdAt?: Date;
}

export interface IProject extends Document {
  title: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: "active" | "draft" | "completed" | "archived";
  tags: string[];
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  images: string[];
  data: Record<string, any>;
  entries: IProjectDataEntry[];
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectDataEntrySchema = new Schema<IProjectDataEntry>(
  {
    key: { type: String, required: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String, default: "json" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "general", index: true },
    status: {
      type: String,
      enum: ["active", "draft", "completed", "archived"],
      default: "active",
      index: true,
    },
    tags: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    repoUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    images: { type: [String], default: [] },
    data: { type: Schema.Types.Mixed, default: {} },
    entries: { type: [ProjectDataEntrySchema], default: [] },
    ownerId: { type: String, index: true },
    ownerName: { type: String, default: "" },
    ownerEmail: { type: String, default: "", index: true },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

export const Project: mongoose.Model<IProject> =
  (mongoose.models.Project as mongoose.Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);

export interface IApiDataItem extends Document {
  collectionName: string;
  projectId?: string;
  title?: string;
  payload: Record<string, any>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApiDataItemSchema = new Schema<IApiDataItem>(
  {
    collectionName: { type: String, default: "default", index: true },
    projectId: { type: String, index: true },
    title: { type: String, default: "" },
    payload: { type: Schema.Types.Mixed, required: true, default: {} },
    createdBy: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "api_data",
  }
);

export const ApiDataItem: mongoose.Model<IApiDataItem> =
  (mongoose.models.ApiDataItem as mongoose.Model<IApiDataItem>) ||
  mongoose.model<IApiDataItem>("ApiDataItem", ApiDataItemSchema);

export default Project;
