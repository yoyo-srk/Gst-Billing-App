import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.business.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { name, gstin, address, phone, state, logo } = await req.json();

    const business = await prisma.business.update({
      where: { id: params.id },
      data: {
        name: name || existing.name,
        gstin: gstin !== undefined ? gstin : existing.gstin,
        address: address !== undefined ? address : existing.address,
        phone: phone !== undefined ? phone : existing.phone,
        state: state !== undefined ? state : existing.state,
        logo: logo !== undefined ? logo : existing.logo,
      },
    });

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Update business error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.business.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    await prisma.business.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Business deleted" });
  } catch (error) {
    console.error("Delete business error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
