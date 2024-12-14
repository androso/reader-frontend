import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oidc";
import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export function configureAuth(app: express.Application) {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize user for the session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user from the session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/auth/google/callback",
      },
      async (issuer: string, profile: any, done: any) => {
        try {
          // Here you would typically:
          // 1. Check if user exists in your database
          // 2. Create new user if they don't exist
          // 3. Return user object
          
          const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            provider: "google",
          };
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Auth routes
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login",
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

  // Middleware to check if user is authenticated
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
}

// Middleware to protect routes
export function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
