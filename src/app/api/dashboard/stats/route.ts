import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalInvoices, invoices, customers, products, lowStockProducts, recentInvoices] = await Promise.all([
      prisma.invoice.count({ where: { userId } }),
      prisma.invoice.findMany({
        where: { userId },
        select: {
          total: true,
          subtotal: true,
          cgst: true,
          sgst: true,
          igst: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.customer.count({ where: { userId } }),
      prisma.product.count({ where: { userId } }),
      prisma.product.count({
        where: {
          userId,
          stock: { lte: 10 },
        },
      }),
      prisma.invoice.findMany({
        where: { userId },
        include: {
          customer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const totalRevenue = invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0);

    const pendingPayments = invoices
      .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
      .reduce((sum, i) => sum + i.total, 0);

    const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0);

    const totalGST = invoices.reduce(
      (sum, i) => sum + i.cgst + i.sgst + i.igst,
      0
    );

    // Monthly sales data for chart (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = month.toLocaleString("default", { month: "short" });

      const monthInvoices = invoices.filter(
        (inv) => inv.createdAt >= month && inv.createdAt < nextMonth
      );

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const count = monthInvoices.length;

      monthlyData.push({
        month: monthName,
        revenue: Math.round(revenue * 100) / 100,
        invoices: count,
      });
    }

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalInvoices,
      pendingPayments: Math.round(pendingPayments * 100) / 100,
      totalCustomers: customers,
      totalProducts: products,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalGST: Math.round(totalGST * 100) / 100,
      lowStockProducts,
      recentInvoices,
      monthlyData,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
