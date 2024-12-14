import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { requireAuth } from "./auth";

interface MulterFile {
  originalname: string;
  filename: string;
  path: string;
}

interface FileRequest extends Request {
  file?: MulterFile;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (path.extname(file.originalname) !== ".epub") {
      return cb(new Error("Only EPUB files are allowed"));
    }
    cb(null, true);
  },
});

export function registerRoutes(app: Express): Server {
  // Authentication status endpoint
  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: req.user,
      });
    } else {
      res.json({
        authenticated: false,
      });
    }
  });

  // Protected routes
  app.post("/api/books", requireAuth, upload.single("file"), (req: FileRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Stub - would normally save to database
    res.json({
      id: req.file.filename,
      path: req.file.path,
    });
  });

  app.get("/api/books/:id", requireAuth, (req, res) => {
    // Stub - would normally fetch from database
    const filePath = path.resolve("./uploads", req.params.id);
    if (!filePath.startsWith(path.resolve("./uploads"))) {
      return res.status(403).send("Invalid file path");
    }
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error serving file:", err);
        res.status(500).send("Error serving file");
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
