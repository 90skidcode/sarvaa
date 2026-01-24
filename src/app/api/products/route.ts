import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryQuery = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("activeOnly");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

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
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (activeOnly === "true") {
      where.isActive = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
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
