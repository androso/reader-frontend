import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/db";
import { uploadFile } from "@/lib/storage";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
   try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({
                error: "Unauthorized"
            }, {
                status: 401
            }) 
        }
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
           return Response.json({error: "no file received"}, { status: 400})
        }

        // get file as a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes)

        // we generate a file key (which would be the filename like "testing.epub")
        const fileKey = `${session.user.id}-${Date.now()}-${file.name}`
        await uploadFile(fileKey, buffer);

        // linking file uploaded to user
        const [book] = await db.insert(books).values({
            title: file.name,
            userId: session.user.id,
            fileKey: fileKey
        }).returning();

        return Response.json({
            message: "File upload successfull",
            book
        });
   } catch(err) {
       console.error("Upload Error", err)

       return Response.json({
           error: "Upload failed"
       }, {
           status: 500
       })
   }
}

export async function GET (request: NextRequest) {
    try {
       // get the file names and ids from db
        const session = await getServerSession(authOptions);
        const booksList = await db.select().from(books).where(eq(books.userId, session!.user.id));
        return Response.json({
            books: booksList
        }) 
    } catch(err) {
        return Response.json({
            error: "Books retrieval failed"
        })
    }   
}