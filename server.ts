import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distServer = path.join(__dirname, "dist", "server.cjs");

// Check if running in development mode (e.g. `npm run dev` with tsx)
const isDev =
  process.env.NODE_ENV !== "production" &&
  (typeof (process as any)[Symbol.for("ts-node.register.instance")] !== "undefined" ||
    process.argv.some((a) => a.includes("tsx")) ||
    process.env.npm_lifecycle_event === "dev");

async function main() {
  if (!isDev) {
    // Production / Cloud Run mode
    process.env.NODE_ENV = "production";
    if (fs.existsSync(distServer)) {
      const require = createRequire(import.meta.url);
      require(distServer);
    } else {
      // If bundle does not exist yet, build it synchronously with esbuild
      try {
        const { buildSync } = await import("esbuild");
        buildSync({
          entryPoints: [path.join(__dirname, "server.core.ts")],
          bundle: true,
          platform: "node",
          format: "cjs",
          packages: "external",
          sourcemap: true,
          outfile: distServer,
        });
        const require = createRequire(import.meta.url);
        require(distServer);
      } catch (err) {
        console.error("Failed to build and start production server:", err);
        process.exit(1);
      }
    }
  } else {
    // Development mode with tsx runtime
<<<<<<< HEAD
    await import("./server.core.ts");
=======
    await import("./server.core.js").catch(async () => {
      await import("./server.core.ts");
    });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  }
}

main().catch((err) => {
  console.error("Server launcher fatal error:", err);
  process.exit(1);
});
