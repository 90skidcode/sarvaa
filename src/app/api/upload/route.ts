import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.resolve("public/uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    let finalBuffer = originalBuffer;
    let extension = path.extname(file.name);

    // Check if it's an image and compress
    if (file.type.startsWith("image/")) {
      try {
        finalBuffer = await sharp(originalBuffer)
          .webp({ quality: 80 })
          .toBuffer();
        extension = ".webp";
      } catch (e) {
        console.warn("Image compression failed, saving original file:", e);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalNameWithoutExt = path
      .parse(file.name)
      .name.replaceAll(/\s+/g, "-");
    const filename = `${timestamp}-${originalNameWithoutExt}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    await writeFile(filepath, finalBuffer);

    // Return URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
