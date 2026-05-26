import { CACHE_TTL, getCached, invalidatePrefix, setCached } from "@/lib/cache";
import { withRetry } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";

const BANNER_TYPES = ["HERO", "PROMO"] as const;
const LINK_TYPES = ["URL", "PRODUCT", "CATEGORY"] as const;

const bannerSchema = z.object({
  title: z.string().min(2, "Banner title must be at least 2 characters").max(200, "Banner title must be at most 200 characters"),
  link: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().nonnegative("Display order cannot be negative").optional(),
  type: z.enum(BANNER_TYPES).optional(),
  ctaLabel: z.string().max(50, "CTA label must be at most 50 characters").optional().nullable(),
  linkType: z.enum(LINK_TYPES).optional(),
  linkProductSlug: z.string().optional().nullable(),
  linkCategorySlug: z.string().optional().nullable(),
});

export const dynamic = "force-dynamic";

// GET all banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const typeFilter = searchParams.get("type");

    // Admin requests bypass cache (need real-time data)
    const cacheKey = !isAdmin
      ? `sarvaa:banners:${typeFilter ?? "all"}`
      : null;

    if (cacheKey) {
      const cached = await getCached<object>(cacheKey);
      if (cached) {
        const res = NextResponse.json(cached);
        res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
        res.headers.set("X-Cache", "HIT");
        return res;
      }
    }

    const where: Record<string, unknown> = isAdmin ? {} : { isActive: true };
    if (typeFilter && (BANNER_TYPES as readonly string[]).includes(typeFilter)) {
      where.type = typeFilter;
    }

    const banners = await withRetry(() => prisma.banner.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    }));
    const payload = { banners };

    if (cacheKey) {
      await setCached(cacheKey, payload, CACHE_TTL.banners);
    }

    const response = NextResponse.json(payload);
    if (!isAdmin) {
      response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      response.headers.set("X-Cache", "MISS");
    }
    return response;
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
    const displayOrder = Number.parseInt(formData.get("displayOrder") as string) || 0;
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;
    const type = (formData.get("type") as string) || "HERO";
    const ctaLabel = (formData.get("ctaLabel") as string | null) || null;
    const linkType = (formData.get("linkType") as string) || "URL";
    const linkProductSlug = (formData.get("linkProductSlug") as string | null) || null;
    const linkCategorySlug = (formData.get("linkCategorySlug") as string | null) || null;

    // Validate input
    try {
      bannerSchema.parse({
        title,
        link,
        displayOrder,
        type,
        ctaLabel,
        linkType,
        linkProductSlug,
        linkCategorySlug,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationError.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
          },
          { status: 400 }
        );
      }
    }

    if (!desktopImageFile) {
      return NextResponse.json(
        { error: "Desktop image is required" },
        { status: 400 },
      );
    }

    // Validate image files
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for banners
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (desktopImageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Desktop image size must be less than 10MB (${(desktopImageFile.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(desktopImageFile.type)) {
      return NextResponse.json(
        { error: `Invalid image format for desktop image. Allowed: JPEG, PNG, WebP` },
        { status: 400 },
      );
    }

    if (mobileImageFile && mobileImageFile.size > 0) {
      if (mobileImageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Mobile image size must be less than 10MB (${(mobileImageFile.size / 1024 / 1024).toFixed(2)}MB)` },
          { status: 400 },
        );
      }

      if (!ALLOWED_TYPES.includes(mobileImageFile.type)) {
        return NextResponse.json(
          { error: `Invalid image format for mobile image. Allowed: JPEG, PNG, WebP` },
          { status: 400 },
        );
      }
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
        desktopFinalBuffer = (await sharp(desktopOriginalBuffer)
          .webp({ quality: 80 })
          .toBuffer()) as any;
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
          mobileFinalBuffer = (await sharp(mobileOriginalBuffer)
            .webp({ quality: 80 })
            .toBuffer()) as any;
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

    // Check for existing banner with same title
    const existingBanner = await prisma.banner.findFirst({
      where: {
        title: { equals: title, mode: 'insensitive' }
      }
    });

    if (existingBanner) {
      return NextResponse.json(
        { error: "A banner with this title already exists" },
        { status: 409 },
      );
    }

    // Create banner in database
    const banner = await prisma.banner.create({
      data: {
        title,
        desktopImage: `/banners/${desktopFilename}`,
        mobileImage: mobileImagePath,
        link: linkType === "URL" ? link || null : null,
        type,
        ctaLabel: ctaLabel || null,
        linkType,
        linkProductSlug: linkType === "PRODUCT" ? linkProductSlug : null,
        linkCategorySlug: linkType === "CATEGORY" ? linkCategorySlug : null,
        displayOrder,
        isActive: true,
      },
    });

    await invalidatePrefix("sarvaa:banners");
    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 },
    );
  }
}
