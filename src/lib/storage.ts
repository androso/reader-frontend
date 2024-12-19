import { S3Client, PutObjectCommand, GetObjectAclCommand, GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
    }
});

export async function uploadFile(key: string, file: Buffer) {
    const command = new PutObjectCommand({
        Bucket: process.env.DO_SPACES_NAME,
        Key: key,
        Body: file,
        ACL: "private"
    });
    
    return s3Client.send(command);
}

export async function getFileUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: process.env.DO_SPACES_NAME,
        Key: key,
    });
    const response = await s3Client.send(command)

    if (!response.Body) {
        throw new Error("No response body")
    }

    const streamBody = response.Body as any;
    const chunks: Uint8Array = [];
    for await (const chunk of streamBody) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks);
}