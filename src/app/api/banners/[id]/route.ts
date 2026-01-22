import { prisma } from "@/lib/prisma";
import { unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

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
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
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
      const bannersDir = path.join(process.cwd(), "public", "banners");
      const desktopBytes = await desktopImageFile.arrayBuffer();
      const desktopBuffer = Buffer.from(desktopBytes);
      const desktopFilename = `desktop-${Date.now()}-${desktopImageFile.name.replace(/\s/g, "-")}`;
      const desktopPath = path.join(bannersDir, desktopFilename);
      await writeFile(desktopPath, desktopBuffer);
      updateData.desktopImage = `/banners/${desktopFilename}`;

      // Delete old desktop image
      try {
        const oldPath = path.join(
          process.cwd(),
          "public",
          existingBanner.desktopImage,
        );
        await unlink(oldPath);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Update mobile image if new one provided
    if (mobileImageFile && mobileImageFile.size > 0) {
      const bannersDir = path.join(process.cwd(), "public", "banners");
      const mobileBytes = await mobileImageFile.arrayBuffer();
      const mobileBuffer = Buffer.from(mobileBytes);
      const mobileFilename = `mobile-${Date.now()}-${mobileImageFile.name.replace(/\s/g, "-")}`;
      const mobilePath = path.join(bannersDir, mobileFilename);
      await writeFile(mobilePath, mobileBuffer);
      updateData.mobileImage = `/banners/${mobileFilename}`;

      // Delete old mobile image
      if (existingBanner.mobileImage) {
        try {
          const oldPath = path.join(
            process.cwd(),
            "public",
            existingBanner.mobileImage,
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
      const desktopPath = path.join(
        process.cwd(),
        "public",
        existingBanner.desktopImage,
      );
      await unlink(desktopPath);
    } catch {
      // Ignore if file doesn't exist
    }

    if (existingBanner.mobileImage) {
      try {
        const mobilePath = path.join(
          process.cwd(),
          "public",
          existingBanner.mobileImage,
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
