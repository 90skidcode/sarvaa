import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100, "Category name must be at most 100 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100, "Slug must be at most 100 characters"),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("activeOnly");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100"); // Default to 100 for categories
    const skip = (page - 1) * limit;

    const where: any = {};
    if (activeOnly === "true") {
      where.isActive = true;
    }

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: [{ displayOrder: "asc" } as any, { name: "asc" }],
      }),
      db.category.count({ where }),
    ]);

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = categorySchema.parse(body);

    // Check for existing category with same name or slug
    const existingCategory = await db.category.findFirst({
      where: {
        OR: [
          { name: { equals: validatedData.name, mode: 'insensitive' } },
          { slug: { equals: validatedData.slug, mode: 'insensitive' } }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `A category with this name or slug already exists` },
        { status: 409 },
      );
    }

    const category = await db.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
