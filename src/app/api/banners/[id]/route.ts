import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// GET single banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 },
    );
  }
}

// PUT - Update a banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const link = formData.get("link") as string | null;
    const displayOrder =
      Number.parseInt(formData.get("displayOrder") as string) || 0;
    const isActive = formData.get("isActive") === "true";
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      title,
      link: link || null,
      displayOrder,
      isActive,
    };

    // Update desktop image if new one provided
    if (desktopImageFile && desktopImageFile.size > 0) {
      const bannersDir = path.resolve("public/banners");
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
      updateData.desktopImage = `/banners/${desktopFilename}`;

      // Delete old desktop image
      try {
        const oldPath = path.resolve(
          "public",
          existingBanner.desktopImage.startsWith("/")
            ? existingBanner.desktopImage.slice(1)
            : existingBanner.desktopImage,
        );
        await unlink(oldPath);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Update mobile image if new one provided
    if (mobileImageFile && mobileImageFile.size > 0) {
      const bannersDir = path.resolve("public/banners");
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
      updateData.mobileImage = `/banners/${mobileFilename}`;

      // Delete old mobile image
      if (existingBanner.mobileImage) {
        try {
          const oldPath = path.resolve(
            "public",
            existingBanner.mobileImage.startsWith("/")
              ? existingBanner.mobileImage.slice(1)
              : existingBanner.mobileImage,
          );
          await unlink(oldPath);
        } catch {
          // Ignore if file doesn't exist
        }
      }
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Delete images
    try {
      const desktopPath = path.resolve(
        "public",
        existingBanner.desktopImage.startsWith("/")
          ? existingBanner.desktopImage.slice(1)
          : existingBanner.desktopImage,
      );
      await unlink(desktopPath);
    } catch {
      // Ignore if file doesn't exist
    }

    if (existingBanner.mobileImage) {
      try {
        const mobilePath = path.resolve(
          "public",
          existingBanner.mobileImage.startsWith("/")
            ? existingBanner.mobileImage.slice(1)
            : existingBanner.mobileImage,
        );
        await unlink(mobilePath);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 },
    );
  }
}
