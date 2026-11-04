/**
 * Next.js App Router: app/api/projects/route.ts
 * GET  /api/projects -> Fetch all projects from MongoDB
 * POST /api/projects -> Add a new project + data into MongoDB
 */
import crypto from "crypto";
import { connectDB } from "../../../lib/mongodb";
import Project from "../../../../models/Project";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const filter: Record<string, any> = {};
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.category = category;

    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
    return Response.json({
      success: true,
      source: "mongodb",
      count: projects.length,
      projects,
      data: projects,
    });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err?.message || "Failed to fetch projects from MongoDB" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const rawTitle = String(body.title || body.name || "").trim();

    if (!rawTitle) {
      return Response.json(
        { success: false, error: "Project title or name is required" },
        { status: 400 }
      );
    }

    const slugBase = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase || "project"}-${crypto.randomBytes(3).toString("hex")}`;

    const project = await Project.create({
      title: rawTitle,
      name: String(body.name || rawTitle).trim(),
      slug,
      description: String(body.description || "").trim(),
      category: String(body.category || "general").trim(),
      status: body.status || "active",
      tags: Array.isArray(body.tags) ? body.tags : [],
      techStack: Array.isArray(body.techStack)
        ? body.techStack
        : ["Next.js", "MongoDB", "Better Auth"],
      repoUrl: body.repoUrl || "",
      liveUrl: body.liveUrl || "",
      thumbnail: body.thumbnail || "",
      data: body.data || {},
      entries: Array.isArray(body.entries) ? body.entries : [],
      ownerId: body.ownerId || "",
      ownerName: body.ownerName || "",
      ownerEmail: body.ownerEmail || "",
      isPublic: body.isPublic !== false,
    });

    return Response.json(
      {
        success: true,
        source: "mongodb",
        message: "Project added to MongoDB successfully",
        project,
        data: project,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return Response.json(
      { success: false, error: err?.message || "Failed to create project in MongoDB" },
      { status: 500 }
    );
  }
}
