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

    const existing = await prisma.product.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const { name, hsn, price, gstRate, category, stock, lowStockAlert, sizeVariants } = await req.json();

    if (sizeVariants) {
      await prisma.sizeVariant.deleteMany({ where: { productId: params.id } });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name || existing.name,
        hsn: hsn !== undefined ? hsn : existing.hsn,
        price: price !== undefined ? parseFloat(price) : existing.price,
        gstRate: gstRate !== undefined ? parseFloat(gstRate) : existing.gstRate,
        category: category !== undefined ? category : existing.category,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        lowStockAlert: lowStockAlert !== undefined ? parseInt(lowStockAlert) : existing.lowStockAlert,
        sizeVariants: sizeVariants?.length
          ? {
              create: sizeVariants.map((sv: { size: string; stock: number; price?: number }) => ({
                size: sv.size,
                stock: sv.stock || 0,
                price: sv.price ? parseFloat(String(sv.price)) : null,
              })),
            }
          : undefined,
      },
      include: { sizeVariants: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const existing = await prisma.product.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
