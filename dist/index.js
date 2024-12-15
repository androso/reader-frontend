// server/index.ts
import express from "express";

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
function configureAuth(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1e3
        // 24 hours
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      async (issuer, profile, done) => {
        try {
          const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            provider: "google"
          };
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"]
    })
  );
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login"
    })
  );
  app.post("/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
}
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// server/routes.ts
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
  app.post("/api/books", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      id: req.file.filename,
      path: req.file.path
    });
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

// server/index.ts
async function startServer(mode, setup) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  configureAuth(app);
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
        console.log(logLine);
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
  const PORT = process.env.PORT || 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`serving on port ${PORT}`);
  });
}
export {
  startServer
};
