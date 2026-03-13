import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

type StaticRoots = {
  publicRoot: string;
  distRoot: string;
};

export function mountStaticServing(
  app: Express,
  { publicRoot, distRoot }: StaticRoots,
): void {

  // Express 5/path-to-regexp no longer accepts bare wildcard strings like "/assets/*".
  app.get(/^\/assets\/.*/, (req: Request, res: Response) => {
    const relativePath = req.path.startsWith("/") ? req.path.slice(1) : req.path;
    const assetPath = path.join(publicRoot, relativePath);

    if (
      !assetPath.startsWith(publicRoot) ||
      !fs.existsSync(assetPath) ||
      !fs.statSync(assetPath).isFile()
    ) {
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

  app.use(express.static(publicRoot));
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
