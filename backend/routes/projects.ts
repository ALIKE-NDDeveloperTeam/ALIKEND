import { Router, Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Project, { ApiDataItem } from "../models/Project";
import User from "../models/User";
import { isMongoConnected } from "../store";
import { connectToMongoDatabase } from "../lib/mongodb";
import { attachBetterAuthUser } from "../lib/betterAuth";
import { getJwtSecret } from "../config/jwt";
import jwt from "jsonwebtoken";

export const projectsRouter = Router();
export const apiDataRouter = Router();

// In-memory fallback stores if MongoDB is temporarily unreachable
const fallbackProjects: any[] = [];
const fallbackDataItems: any[] = [];

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `project-${Date.now()}`
  );
}

projectsRouter.use(attachBetterAuthUser);
apiDataRouter.use(attachBetterAuthUser);

/**
 * GET /api/projects
 * Fetch all projects from MongoDB (with optional filtering by status, category, search, ownerId)
 */
projectsRouter.get("/", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { status, category, search, ownerId, limit = "100" } = req.query;

    if (isMongoConnected()) {
      const filter: Record<string, any> = {};
      if (status && status !== "all") filter.status = String(status);
      if (category && category !== "all") filter.category = String(category);
      if (ownerId) filter.ownerId = String(ownerId);
      if (search && String(search).trim()) {
        const q = String(search).trim();
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ];
      }

      const maxLimit = Math.min(Math.max(parseInt(String(limit), 10) || 100, 1), 500);
      const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(maxLimit).lean();

      return res.json({
        success: true,
        source: "mongodb",
        count: projects.length,
        projects,
        data: projects,
      });
    }

    // Fallback if MongoDB is offline
    let list = [...fallbackProjects];
    if (status && status !== "all") list = list.filter((p) => p.status === status);
    if (category && category !== "all") list = list.filter((p) => p.category === category);
    if (ownerId) list = list.filter((p) => p.ownerId === ownerId);
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      source: "memory_fallback",
      count: list.length,
      projects: list,
      data: list,
    });
  } catch (err: any) {
    console.error("[Projects API] GET /api/projects error:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch projects from MongoDB",
    });
  }
});

/**
 * GET /api/projects/:id
 * Fetch a single project by MongoDB ObjectId or slug
 */
projectsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { id } = req.params;

    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slug: id }] }
        : { slug: id };
      const project = await Project.findOne(query).lean();
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found in MongoDB" });
      }
      return res.json({ success: true, source: "mongodb", project, data: project });
    }

    const project = fallbackProjects.find((p) => String(p._id) === id || p.slug === id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    return res.json({ success: true, source: "memory_fallback", project, data: project });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch project",
    });
  }
});

/**
 * POST /api/projects
 * Add/create a new project in MongoDB and store its custom data
 */
projectsRouter.post("/", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const body = req.body || {};
    const rawTitle = String(body.title || body.name || "").trim();

    if (!rawTitle) {
      return res.status(400).json({
        success: false,
        error: "Project title or name is required.",
      });
    }

    let authedUser = (req as any).betterAuthUser;
    if (!authedUser) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const secret = getJwtSecret();
        if (secret) {
          try {
            const dec: any = jwt.verify(token, secret);
            if (dec && dec.userId) {
              authedUser = {
                id: String(dec.userId),
                email: dec.email || "",
                name: dec.fullName || dec.email?.split("@")[0] || "User",
              };
            }
          } catch {}
        }
      }
    }

    const baseSlug = body.slug ? slugify(String(body.slug)) : slugify(rawTitle);
    const uniqueSlug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;

    const projectPayload = {
      title: rawTitle,
      name: String(body.name || rawTitle).trim(),
      slug: uniqueSlug,
      description: String(body.description || "").trim(),
      category: String(body.category || "general").trim(),
      status: ["active", "draft", "completed", "archived"].includes(body.status)
        ? body.status
        : "active",
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      techStack: Array.isArray(body.techStack) ? body.techStack.map(String) : ["Next.js", "MongoDB", "Better Auth"],
      repoUrl: String(body.repoUrl || "").trim(),
      liveUrl: String(body.liveUrl || "").trim(),
      thumbnail: String(body.thumbnail || body.image || "").trim(),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      data: body.data && typeof body.data === "object" ? body.data : {},
      entries: Array.isArray(body.entries) ? body.entries : [],
      ownerId: body.ownerId || authedUser?.id || "",
      ownerName: body.ownerName || authedUser?.name || "",
      ownerEmail: body.ownerEmail || authedUser?.email || "",
      isPublic: body.isPublic !== false,
    };

    if (isMongoConnected()) {
      const created = await Project.create(projectPayload);

      // If project has an owner, link project to the user's customData in MongoDB
      if (created.ownerId && mongoose.Types.ObjectId.isValid(created.ownerId)) {
        try {
          await User.findByIdAndUpdate(created.ownerId, {
            $addToSet: { "customData.projectIds": String(created._id) },
            $set: { "customData.lastProjectCreated": new Date() },
          });
        } catch (linkErr: any) {
          console.warn("Could not link project to user document:", linkErr?.message);
        }
      }

      return res.status(201).json({
        success: true,
        source: "mongodb",
        message: "Project successfully saved to MongoDB.",
        project: created,
        data: created,
      });
    }

    const fallbackDoc = {
      _id: `proj_${crypto.randomBytes(8).toString("hex")}`,
      ...projectPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    fallbackProjects.unshift(fallbackDoc);

    return res.status(201).json({
      success: true,
      source: "memory_fallback",
      message: "Project saved (in-memory fallback active).",
      project: fallbackDoc,
      data: fallbackDoc,
    });
  } catch (err: any) {
    console.error("[Projects API] POST /api/projects error:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to create project in MongoDB",
    });
  }
});

/**
 * PUT / PATCH /api/projects/:id
 * Update an existing project or its data in MongoDB
 */
const updateProjectHandler = async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { id } = req.params;
    const updates = { ...(req.body || {}) };
    delete updates._id;

    if (updates.title && !updates.name) {
      updates.name = updates.title;
    } else if (updates.name && !updates.title) {
      updates.title = updates.name;
    }

    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slug: id }] }
        : { slug: id };

      const updated = await Project.findOneAndUpdate(
        query,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: "Project not found in MongoDB" });
      }

      return res.json({
        success: true,
        source: "mongodb",
        message: "Project updated in MongoDB.",
        project: updated,
        data: updated,
      });
    }

    const idx = fallbackProjects.findIndex((p) => String(p._id) === id || p.slug === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    fallbackProjects[idx] = {
      ...fallbackProjects[idx],
      ...updates,
      updatedAt: new Date(),
    };

    return res.json({
      success: true,
      source: "memory_fallback",
      project: fallbackProjects[idx],
      data: fallbackProjects[idx],
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to update project",
    });
  }
};

projectsRouter.put("/:id", updateProjectHandler);
projectsRouter.patch("/:id", updateProjectHandler);

/**
 * POST /api/projects/:id/data
 * Add a key-value or JSON data entry inside a specific project in MongoDB
 */
projectsRouter.post("/:id/data", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { id } = req.params;
    const { key, value, type = "json", data } = req.body || {};

    const entryKey = String(key || "entry_" + Date.now()).trim();
    const entryValue = value !== undefined ? value : data;

    if (entryValue === undefined) {
      return res.status(400).json({
        success: false,
        error: "Provide 'value' or 'data' in request body to add data to this project.",
      });
    }

    const newEntry = {
      key: entryKey,
      value: entryValue,
      type: String(type),
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slug: id }] }
        : { slug: id };

      const updated = await Project.findOneAndUpdate(
        query,
        {
          $push: { entries: newEntry },
          $set: { [`data.${entryKey}`]: entryValue },
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: "Project not found in MongoDB" });
      }

      return res.status(201).json({
        success: true,
        source: "mongodb",
        message: "Data added to project in MongoDB.",
        entry: newEntry,
        project: updated,
      });
    }

    const project = fallbackProjects.find((p) => String(p._id) === id || p.slug === id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    project.entries = Array.isArray(project.entries) ? [...project.entries, newEntry] : [newEntry];
    project.data = { ...(project.data || {}), [entryKey]: entryValue };
    project.updatedAt = new Date();

    return res.status(201).json({
      success: true,
      source: "memory_fallback",
      entry: newEntry,
      project,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to add data to project",
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Remove a project from MongoDB
 */
projectsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { id } = req.params;

    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slug: id }] }
        : { slug: id };
      const deleted = await Project.findOneAndDelete(query);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Project not found in MongoDB" });
      }
      return res.json({
        success: true,
        source: "mongodb",
        message: "Project deleted from MongoDB.",
        deletedId: id,
      });
    }

    const idx = fallbackProjects.findIndex((p) => String(p._id) === id || p.slug === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    fallbackProjects.splice(idx, 1);

    return res.json({
      success: true,
      source: "memory_fallback",
      deletedId: id,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to delete project",
    });
  }
});

/**
 * GET /api/data
 * Fetch generic JSON documents stored via the Data API in MongoDB ('api_data' collection)
 */
apiDataRouter.get("/", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { collectionName, projectId, limit = "100" } = req.query;

    if (isMongoConnected()) {
      const filter: Record<string, any> = {};
      if (collectionName) filter.collectionName = String(collectionName);
      if (projectId) filter.projectId = String(projectId);

      const items = await ApiDataItem.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit) || 100, 500))
        .lean();

      return res.json({
        success: true,
        source: "mongodb",
        count: items.length,
        items,
        data: items,
      });
    }

    let items = [...fallbackDataItems];
    if (collectionName) items = items.filter((i) => i.collectionName === collectionName);
    if (projectId) items = items.filter((i) => i.projectId === projectId);

    return res.json({
      success: true,
      source: "memory_fallback",
      count: items.length,
      items,
      data: items,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch API data from MongoDB",
    });
  }
});

/**
 * POST /api/data
 * Insert any JSON data document into MongoDB ('api_data' collection)
 */
apiDataRouter.post("/", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const body = req.body || {};
    const authedUser = (req as any).betterAuthUser;

    const docPayload = {
      collectionName: String(body.collectionName || body.collection || "default").trim(),
      projectId: body.projectId ? String(body.projectId).trim() : undefined,
      title: String(body.title || body.name || "").trim(),
      payload: body.payload !== undefined ? body.payload : body.data !== undefined ? body.data : body,
      createdBy: body.createdBy || authedUser?.email || authedUser?.id || "anonymous",
    };

    if (isMongoConnected()) {
      const created = await ApiDataItem.create(docPayload);
      return res.status(201).json({
        success: true,
        source: "mongodb",
        message: "Data saved to MongoDB.",
        item: created,
        data: created,
      });
    }

    const fallbackItem = {
      _id: `data_${crypto.randomBytes(8).toString("hex")}`,
      ...docPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    fallbackDataItems.unshift(fallbackItem);

    return res.status(201).json({
      success: true,
      source: "memory_fallback",
      item: fallbackItem,
      data: fallbackItem,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to store data in MongoDB",
    });
  }
});

/**
 * DELETE /api/data/:id
 * Delete a generic data item from MongoDB
 */
apiDataRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { id } = req.params;

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid MongoDB document ID" });
      }
      const deleted = await ApiDataItem.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Data item not found in MongoDB" });
      }
      return res.json({ success: true, source: "mongodb", deletedId: id });
    }

    const idx = fallbackDataItems.findIndex((i) => String(i._id) === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Data item not found" });
    }
    fallbackDataItems.splice(idx, 1);
    return res.json({ success: true, source: "memory_fallback", deletedId: id });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to delete data item",
    });
  }
});

export default projectsRouter;
