// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import path from "path";
var upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
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
  app.post("/api/books", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      id: req.file.filename,
      path: req.file.path
    });
  });
  app.get("/api/books/:id", (req, res) => {
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

// server/index.ts
async function startServer(mode, setup) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path2.startsWith("/api")) {
        let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "\u2026";
        }
      }
    });
    next();
  });
  const server = registerRoutes(app);
  app.use(
    (err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    }
  );
  await setup(app, server);
  const PORT = process.env.PORT || 3e3;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`serving on port ${PORT}`);
  });
}
export {
  startServer
};
