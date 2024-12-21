"use server"
import { db } from "@/db"
import { books } from "@/db/schema"
import { eq } from "drizzle-orm"
import { deleteFile } from "@/lib/storage";

export async function deleteBook(bookId: string) {
    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

    if (book) {
        try {
            await deleteFile(book.fileKey);
            
            await db.delete(books).where(eq(books.id, bookId));
            
            return {
                success: true,
                message: "Book deleted succesfully",
            }
        }
        catch(e){
            // do something with the error
            console.log("failed to delete book", e)

            return {
                success: false,
                message: "Failed to delete book"
            }
        }
    } else {
        return {
            success: false,
            message: "Book not found"    
        }
    }

    
    // await db.delete(books).where(eq(books.id, bookId));
}
