import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getFileUrl } from "@/lib/storage"

export async function GET(
    request: NextRequest,
    { params }: { params: { id : string }}
) {
    try {
        // Await the params object before accessing id
        const newParams = await params;
        const fileBuffer = await getFileUrl(newParams.id); 
         
        return new Response(fileBuffer, {
            status: 200,
        });
    } catch (error) {
        console.log(error)
        return Response.json({ error: error.message }, { status: 500 });
    }
}