import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(
    request: NextRequest,
    { params }: { params: { id : string }}
) {
    try {
        // Await the params object before accessing id
        const newParams = await params;
        const filePath = path.join(process.cwd(), 'public', 'uploads', newParams.id ?? "");
        const fileBuffer = await fs.readFile(filePath);

        return new Response(fileBuffer, {
            status: 200,
        });
    } catch (error) {
        console.log(error)
        return Response.json({ error: "File not found" }, { status: 404 });
    }
}