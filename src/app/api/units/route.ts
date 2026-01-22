import { db as prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let units = await prisma.unit.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    // Seed default units if none exist
    if (units.length === 0) {
      const defaultUnits = [
        { name: "Pieces", abbreviation: "pcs" },
        { name: "Kilograms", abbreviation: "kg" },
        { name: "Grams", abbreviation: "g" },
        { name: "Milliliters", abbreviation: "ml" },
      ];

      await Promise.all(
        defaultUnits.map((unit) =>
          prisma.unit.create({
            data: unit,
          }),
        ),
      );

      units = await prisma.unit.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, abbreviation } = body;

    if (!name || !abbreviation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const unit = await prisma.unit.create({
      data: {
        name,
        abbreviation,
      },
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 },
    );
  }
}
