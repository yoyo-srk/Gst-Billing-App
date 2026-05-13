import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const lowStock = searchParams.get("lowStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const businessId = searchParams.get("businessId");

    const where: Record<string, unknown> = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { hsn: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    if (lowStock === "true") {
      where.stock = { lte: 10 };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { sizeVariants: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const categories = await prisma.product.findMany({
      where: { userId },
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, hsn, price, gstRate, category, stock, lowStockAlert, businessId, sizeVariants } = await req.json();

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        hsn: hsn || null,
        price: parseFloat(price),
        gstRate: gstRate !== undefined ? parseFloat(gstRate) : 18,
        category: category || null,
        stock: stock !== undefined ? parseInt(stock) : 0,
        lowStockAlert: lowStockAlert !== undefined ? parseInt(lowStockAlert) : 10,
        userId,
        businessId: businessId || null,
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

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
