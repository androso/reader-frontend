import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  image: text("image"),
  googleId: text("google_id").unique(),
  password: text("password"), // For future email+password auth
  username: text("username").unique(), // For future username support
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  fileKey: text("file_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export type InsertBook = typeof books.$inferInsert;
export type SelectBook = typeof books.$inferSelect;

export type InsertUser= typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;