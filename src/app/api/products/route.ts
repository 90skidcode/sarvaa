import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
    const {
      name,
      slug,
      description,
      price,
      image,
      stock,
      featured,
      isActive,
      categoryId,
      weights,
      images,
    } = body;

    if (!name || !slug || !description || !price || !image || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number.parseFloat(price),
        image,
        stock: Number.parseInt(stock) || 0,
        featured: featured || false,
        isActive: typeof isActive === "boolean" ? isActive : true,
        weights: (function () {
          if (!weights) return null;
          return typeof weights === "string"
            ? weights
            : JSON.stringify(weights);
        })(),
        categoryId,
        images,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
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
