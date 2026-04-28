import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(200, "Product name must be at most 200 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(200, "Slug must be at most 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must be at most 5000 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  image: z.string().min(1, "Image is required"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative").optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().min(1, "Category is required"),
  weights: z.string().optional().nullable(),
  images: z.string().optional().nullable()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryQuery = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("activeOnly");
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = Number.parseFloat(
      searchParams.get("maxPrice") || "1000000",
    );
    const sortBy = searchParams.get("sortBy") || "newest";

    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: activeOnly === "false" ? undefined : true,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (categoryQuery) {
      where.category = {
        slug: categoryQuery,
      };
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Prepare ordering
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    if (sortBy === "price_desc") orderBy = { price: "desc" };
    if (sortBy === "popularity") orderBy = { featured: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = productSchema.parse(body);

    // Check for existing product with same name or slug
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { equals: validatedData.name, mode: 'insensitive' } },
          { slug: { equals: validatedData.slug, mode: 'insensitive' } }
        ]
      }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this name or slug already exists" },
        { status: 409 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: validatedData.price,
        image: validatedData.image,
        stock: validatedData.stock || 0,
        featured: validatedData.featured || false,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        weights: validatedData.weights || null,
        categoryId: validatedData.categoryId,
        images: validatedData.images || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((e: z.ZodIssue) => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: "Failed to create product",
        message: error.message,
        details: error.code,
      },
      { status: 500 },
    );
  }
}
