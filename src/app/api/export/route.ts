import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const type = searchParams.get("type") || "invoices";

    const where: Record<string, unknown> = { userId };

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      if (type === "invoices") {
        where.invoiceDate = { gte: startDate, lte: endDate };
      } else {
        where.createdAt = { gte: startDate, lte: endDate };
      }
    }

    if (type === "invoices") {
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          items: true,
        },
        orderBy: { invoiceDate: "desc" },
      });

      const data = invoices.map((inv) => ({
        "Invoice #": inv.invoiceNumber,
        Customer: inv.customer.name,
        Date: inv.invoiceDate.toLocaleDateString("en-IN"),
        Subtotal: inv.subtotal,
        CGST: inv.cgst,
        SGST: inv.sgst,
        IGST: inv.igst,
        Discount: inv.discount,
        Total: inv.total,
        Status: inv.status,
        Items: inv.items.length,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Invoices");

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="invoices-export.xlsx"`,
        },
      });
    } else {
      const products = await prisma.product.findMany({
        where,
        include: { sizeVariants: true },
        orderBy: { name: "asc" },
      });

      const data = products.map((p) => ({
        Name: p.name,
        "HSN Code": p.hsn || "-",
        Category: p.category || "-",
        Price: p.price,
        "GST Rate": `${p.gstRate}%`,
        Stock: p.stock,
        "Low Stock Alert": p.lowStockAlert,
        "Size Variants": p.sizeVariants.map((sv) => `${sv.size}(${sv.stock})`).join(", ") || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="products-export.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
