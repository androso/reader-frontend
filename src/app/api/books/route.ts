import { NextRequest } from "next/server";
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
   try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
           return Response.json({error: "no file received"}, { status: 400})
        }

        // get file as a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes)

        // create dir in case it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        
        await fs.mkdir(uploadDir, { recursive: true })

        const uniqueFilename = Date.now() + path.extname(file.name)
        await fs.writeFile(path.join(uploadDir, uniqueFilename), buffer)

       return Response.json({
           message: "File upload successful",
           id: uniqueFilename,
           title: file.name
       })
   } catch(err) {
       console.error("Upload Error", err)

       return Response.json({
           error: "Upload failed"
       }, {
           status: 500
       })
   }
}