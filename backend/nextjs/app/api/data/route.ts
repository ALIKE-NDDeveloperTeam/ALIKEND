/**
 * Next.js App Router: app/api/data/route.ts
 * GET  /api/data -> Fetch data documents from MongoDB (`api_data` collection)
 * POST /api/data -> Add any JSON data document to MongoDB (`api_data` collection)
 */
import { connectDB } from "../../../lib/mongodb";
import { ApiDataItem } from "../../../../models/Project";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collectionName");
    const projectId = searchParams.get("projectId");

    const filter: Record<string, any> = {};
    if (collectionName) filter.collectionName = collectionName;
    if (projectId) filter.projectId = projectId;

    const items = await ApiDataItem.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return Response.json({
      success: true,
      source: "mongodb",
      count: items.length,
      items,
      data: items,
    });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err?.message || "Failed to fetch data from MongoDB" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const item = await ApiDataItem.create({
      collectionName: String(body.collectionName || body.collection || "default").trim(),
      projectId: body.projectId ? String(body.projectId).trim() : undefined,
      title: String(body.title || body.name || "").trim(),
      payload: body.payload !== undefined ? body.payload : body.data !== undefined ? body.data : body,
      createdBy: body.createdBy || "api",
    });

    return Response.json(
      {
        success: true,
        source: "mongodb",
        message: "Data saved to MongoDB successfully",
        item,
        data: item,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return Response.json(
      { success: false, error: err?.message || "Failed to save data to MongoDB" },
      { status: 500 }
    );
  }
}
