"use server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createUserFromGoogle(userData: {
  email: string;
  googleId: string;
  name: string;
  image?: string;
}) {
  const result = await db
    .insert(users)
    .values({
      email: userData.email,
      googleId: userData.googleId,
      name: userData.name,
      image: userData.image,
    })
    .returning();

  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

export async function getUserByGoogleId(googleId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.googleId, googleId));
  return result[0];
}
