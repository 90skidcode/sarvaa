import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    // Handle both async and sync params for Next.js 15
    const params = await Promise.resolve(context.params);
    const productId = params.id;

    console.log("Fetching product with ID:", productId);

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    console.log("Product found:", product ? "Yes" : "No");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const params = await Promise.resolve(context.params);
    const productId = params.id;

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
    } = body;

    const product = await db.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number.parseFloat(price) }),
        ...(image !== undefined && { image }),
        ...(stock !== undefined && { stock: Number.parseInt(stock) }),
        ...(featured !== undefined && { featured }),
        ...(isActive !== undefined && { isActive }),
        ...(categoryId && { categoryId }),
        ...(weights !== undefined && {
          weights: (function () {
            if (!weights) return null;
            return typeof weights === "string"
              ? weights
              : JSON.stringify(weights);
          })(),
        }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        error: "Failed to update product",
        message: error.message,
        details: error.code,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const params = await Promise.resolve(context.params);
    const productId = params.id;

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
