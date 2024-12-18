"use server"
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function createUserFromGoogle(userData: {
  email: string;
  googleId: string;
  name: string;
  image?: string;
}) {
  const result = await db.insert(users).values({
    email: userData.email,
    googleId: userData.googleId,
    name: userData.name,
    image: userData.image,
  }).returning();
  
  return result[0];
}

export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email)
  });
}

export async function getUserByGoogleId(googleId: string) {
  return await db.query.users.findFirst({
    where: eq(users.googleId, googleId)
  });
}
