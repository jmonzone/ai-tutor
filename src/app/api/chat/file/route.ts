import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUserAndConnect } from "@/lib/mongodb";
import { File } from "@/models/File";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserAndConnect(req);
    console.log("uploading file", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, fileType } = await req.json();

    const safeFilename = encodeURIComponent(filename);

    const key = `files/${userId}/${Date.now()}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    console.log("getSignedUrl", uploadUrl);

    const fileDoc = await File.create({
      userId,
      filename,
      s3Key: key,
    });

    console.log("create", fileDoc._id);

    return NextResponse.json({
      uploadUrl,
      id: fileDoc._id,
      filename: fileDoc.filename,
      s3Key: fileDoc.s3Key,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
