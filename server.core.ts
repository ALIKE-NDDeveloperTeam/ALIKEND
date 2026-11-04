import dotenv from "dotenv";
dotenv.config({ override: true });
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import app from "./backend/app";

// Safe process-level safety handlers to prevent rollout crashes
process.on("unhandledRejection", (reason, _promise) => {
  console.warn("⚠️ [UNHANDLED REJECTION]:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("💥 [UNCAUGHT EXCEPTION]:", error);
});

process.on("SIGTERM", () => {
  console.log("🛑 [SIGTERM] Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 [SIGINT] Shutting down gracefully...");
  process.exit(0);
});

// Safe __dirname resolution across ESM (tsx) and CJS (dist bundle)
const getDirname = () => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (_e) {
    // Fallback
  }
  return typeof __dirname !== "undefined" ? __dirname : process.cwd();
};

async function startServer() {
  const currentDir = getDirname();

  // In development, tsx runs server.ts from the workspace root.
  // In production (Cloud Run rollout), the bundled dist/server.cjs runs.
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (typeof __dirname !== "undefined" && __dirname.endsWith("dist"));

  // Serve public static assets (including /category-icons/...) directly with correct MIME types
  const publicDir = path.join(process.cwd(), "public");
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  if (!isProduction) {
    // Development mode: load Vite middleware for on-the-fly TSX compilation
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: locate built assets reliably in dist folder
    const candidatePaths = [
      path.join(process.cwd(), "dist"),
      path.join(currentDir, "dist"),
      currentDir,
    ];

    const distPath =
      candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) ||
      path.join(process.cwd(), "dist");

    console.log(`[PRODUCTION SERVER] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send("Alikendshop App running");
      }
    });
  }

  // PORT RESOLUTION:
  // In AI Studio (both dev and Cloud Run rollout), Nginx listens on port 8080
  // and reverse-proxies all external requests to http://localhost:3000.
  // The Node application must always bind to port 3000.
  const targetPort = 3000;

  const server = app.listen(targetPort, "0.0.0.0", () => {
    console.log(
      `🚀 [SERVER RUNNING] Listening on 0.0.0.0:${targetPort} (${isProduction ? "production / Cloud Run" : "development / sandbox"})`
    );
  });

  server.on("error", (err: any) => {
    console.error(`Primary listener error on port ${targetPort}:`, err);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
