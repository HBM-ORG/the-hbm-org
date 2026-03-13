import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

type StaticRoots = {
  publicRoots: string[];
  distRoot: string;
};

export function mountStaticServing(
  app: Express,
  { publicRoots, distRoot }: StaticRoots,
): void {
  const normalizedRoots = publicRoots.filter(Boolean);

  // Express 5/path-to-regexp no longer accepts bare wildcard strings like "/assets/*".
  app.get(/^\/assets\/.*/, (req: Request, res: Response) => {
    const rawRelativePath = req.path.startsWith("/") ? req.path.slice(1) : req.path;
    let relativePath = rawRelativePath;

    try {
      relativePath = decodeURIComponent(rawRelativePath);
    } catch {
      res.status(400).send("Invalid asset path");
      return;
    }

    let assetPath: string | null = null;

    for (const root of normalizedRoots) {
      const candidate = path.join(root, relativePath);
      if (
        candidate.startsWith(root) &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      ) {
        assetPath = candidate;
        break;
      }
    }

    if (!assetPath) {
      res.status(404).send("Not found");
      return;
    }

    const ext = path.extname(assetPath).toLowerCase();
    const mime =
      ext === ".mp4"
        ? "video/mp4"
        : ext === ".webm"
          ? "video/webm"
          : ext === ".mov"
            ? "video/quicktime"
            : undefined;

    if (mime) res.setHeader("Content-Type", mime);
    res.setHeader("Accept-Ranges", "bytes");
    res.sendFile(assetPath);
  });

  for (const root of normalizedRoots) {
    app.use(express.static(root));
  }
  app.use(express.static(distRoot));

  app.get(/^(?!\/api|\/assets).*/, (_req: Request, res: Response) => {
    const indexPath = path.join(distRoot, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }

    res.status(404).json({ error: "Not Found" });
  });

  app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ error: "API Endpoint not found" });
  });
}
