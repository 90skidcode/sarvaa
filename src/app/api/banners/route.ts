import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// GET all banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 },
    );
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const link = formData.get("link") as string | null;
    const displayOrder =
      Number.parseInt(formData.get("displayOrder") as string) || 0;
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!desktopImageFile) {
      return NextResponse.json(
        { error: "Desktop image is required" },
        { status: 400 },
      );
    }

    // Create banners directory if it doesn't exist
    const bannersDir = path.resolve("public/banners");
    await mkdir(bannersDir, { recursive: true });

    // Save desktop image
    const desktopBytes = await desktopImageFile.arrayBuffer();
    const desktopOriginalBuffer = Buffer.from(desktopBytes);
    let desktopFinalBuffer = desktopOriginalBuffer;
    let desktopExtension = path.extname(desktopImageFile.name);

    if (desktopImageFile.type.startsWith("image/")) {
      try {
        desktopFinalBuffer = await sharp(desktopOriginalBuffer)
          .webp({ quality: 80 })
          .toBuffer();
        desktopExtension = ".webp";
      } catch (e) {
        console.warn("Desktop banner compression failed:", e);
      }
    }

    const desktopFilename = `desktop-${Date.now()}-${desktopImageFile.name.replaceAll(/\s/g, "-")}${desktopExtension}`;
    const desktopPath = path.join(bannersDir, desktopFilename);
    await writeFile(desktopPath, desktopFinalBuffer);

    // Save mobile image if provided
    let mobileImagePath: string | null = null;
    if (mobileImageFile && mobileImageFile.size > 0) {
      const mobileBytes = await mobileImageFile.arrayBuffer();
      const mobileOriginalBuffer = Buffer.from(mobileBytes);
      let mobileFinalBuffer = mobileOriginalBuffer;
      let mobileExtension = path.extname(mobileImageFile.name);

      if (mobileImageFile.type.startsWith("image/")) {
        try {
          mobileFinalBuffer = await sharp(mobileOriginalBuffer)
            .webp({ quality: 80 })
            .toBuffer();
          mobileExtension = ".webp";
        } catch (e) {
          console.warn("Mobile banner compression failed:", e);
        }
      }

      const mobileFilename = `mobile-${Date.now()}-${mobileImageFile.name.replaceAll(/\s/g, "-")}${mobileExtension}`;
      const mobilePath = path.join(bannersDir, mobileFilename);
      await writeFile(mobilePath, mobileFinalBuffer);
      mobileImagePath = `/banners/${mobileFilename}`;
    }

    // Create banner in database
    const banner = await prisma.banner.create({
      data: {
        title,
        desktopImage: `/banners/${desktopFilename}`,
        mobileImage: mobileImagePath,
        link: link || null,
        displayOrder,
        isActive: true,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 },
    );
  }
}
