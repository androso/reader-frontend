// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import path from "path";

// server/auth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oidc";
import session from "express-session";
import MemoryStore from "memorystore";
var SessionStore = MemoryStore(session);
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// server/routes.ts
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

var upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname) !== ".epub") {
      return cb(new Error("Only EPUB files are allowed"));
    }
    cb(null, true);
  }
});
function registerRoutes(app) {
  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: req.user
      });
    } else {
      res.json({
        authenticated: false
      });
    }
  });
  app.post("/api/books", requireAuth, async (req, res) => {
    try {
      // Ensure uploads directory exists (redundant, but kept for clarity)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      upload.single("file")(req, res, (err) => {
        if (err) {
          console.error("Upload error:", err);
          return res.status(400).json({ 
            message: "Error uploading file",
            details: err.message 
          });
        }
        
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        res.json({
          id: req.file.filename,
          path: req.file.path,
          message: "File uploaded successfully"
        });
      });
    } catch (error) {
      console.error("Server error during upload:", error);
      res.status(500).json({ 
        message: "Server error during upload",
        details: error.message 
      });
    }
  });
  app.get("/api/books/:id", requireAuth, (req, res) => {
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
export {
  registerRoutes
};