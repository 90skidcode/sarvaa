import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// DELETE a customer profile (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    // Check if profile exists
    const profile = await db.userProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db.userProfile.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Customer profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 },
    );
  }
}
