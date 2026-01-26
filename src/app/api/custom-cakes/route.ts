import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// GET all custom cake orders (Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");

    const where: any = {};
    if (storeId && storeId !== "all") where.storeId = storeId;
    if (status && status !== "all") where.status = status;

    const orders = await prisma.customCakeOrder.findMany({
      where,
      include: { store: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching custom cake orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// POST - Submit a new custom cake order
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const customerName = formData.get("customerName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string | null;
    const description = formData.get("description") as string | null;
    const storeId = formData.get("storeId") as string;
    const preferredDateStr = formData.get("preferredDate") as string | null;
    const cakeImageFiles = formData.getAll("cakeImages") as File[];

    if (!customerName || !phone || !storeId || cakeImageFiles.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create custom-cakes directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "custom-cakes",
    );
    await mkdir(uploadDir, { recursive: true });

    const cakeImagePaths: string[] = [];

    // Save all images
    for (const file of cakeImageFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `cake-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, "-")}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      cakeImagePaths.push(`/uploads/custom-cakes/${filename}`);
    }

    // Create order in database
    const order = await prisma.customCakeOrder.create({
      data: {
        customerName,
        phone,
        email,
        description,
        storeId,
        cakeImage: cakeImagePaths[0], // Primary image
        images: JSON.stringify(cakeImagePaths), // All images
        preferredDate: preferredDateStr ? new Date(preferredDateStr) : null,
        status: "pending",
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom cake order:", error);
    return NextResponse.json(
      {
        error: "Failed to submit order",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
