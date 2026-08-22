import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PROJECT_DIR = path.join(process.cwd(), "bannerhub-revanced-1.0.0-609");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/project/info", (req, res) => {
    const exists = fs.existsSync(PROJECT_DIR);
    if (!exists) {
      return res.json({
        exists: false,
        name: "BannerHub ReVanced",
        version: "v1.0.0-609",
        status: "not_extracted"
      });
    }

    let filesCount = 0;
    function countFiles(dir: string) {
      try {
        const list = fs.readdirSync(dir);
        for (const item of list) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            countFiles(fullPath);
          } else {
            filesCount++;
          }
        }
      } catch (e) {}
    }
    countFiles(PROJECT_DIR);

    res.json({
      exists: true,
      name: "DeskHub emulator",
      version: "v1.0.5",
      sourceUrl: "https://github.com/hero942008/Banerhubhero",
      targetApp: "DeskHub emulator (com.xj.herohuboptimized)",
      totalFiles: filesCount,
      projectPath: PROJECT_DIR,
      status: "ready"
    });
  });

  // Get file tree
  app.get("/api/project/tree", (req, res) => {
    if (!fs.existsSync(PROJECT_DIR)) {
      return res.status(404).json({ error: "Project not found" });
    }

    function getTree(dir: string, relativePath = ""): any {
      try {
        const items = fs.readdirSync(dir);
        return items
          .filter((item) => !item.startsWith(".git/") && item !== ".gradle")
          .map((item) => {
            const fullPath = path.join(dir, item);
            const relItemPath = relativePath ? `${relativePath}/${item}` : item;
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              return {
                name: item,
                path: relItemPath,
                type: "directory",
                children: getTree(fullPath, relItemPath)
              };
            } else {
              return {
                name: item,
                path: relItemPath,
                type: "file",
                size: stat.size
              };
            }
          });
      } catch (e) {
        return [];
      }
    }

    const tree = getTree(PROJECT_DIR);
    res.json({ tree });
  });

  // Get file content
  app.get("/api/project/file", (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) {
      return res.status(400).json({ error: "Path query parameter required" });
    }

    const resolved = path.resolve(PROJECT_DIR, filePath);
    if (!resolved.startsWith(PROJECT_DIR)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
      return res.status(404).json({ error: "File not found" });
    }

    try {
      const content = fs.readFileSync(resolved, "utf-8");
      res.json({ path: filePath, content });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to read file" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
