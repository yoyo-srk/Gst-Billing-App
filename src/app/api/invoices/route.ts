import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = { userId };

    if (status && status !== "all") {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (from || to) {
      where.invoiceDate = {};
      if (from) {
        (where.invoiceDate as Record<string, unknown>).gte = new Date(from);
      }
      if (to) {
        (where.invoiceDate as Record<string, unknown>).lte = new Date(to);
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Get invoices error:", error);
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

    const body = await req.json();
    const {
      customerId,
      invoiceDate,
      dueDate,
      placeOfSupply,
      sellerState,
      subtotal,
      cgst,
      sgst,
      igst,
      discount,
      total,
      status,
      notes,
      template,
      items,
    } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and at least one item are required" },
        { status: 400 }
      );
    }

    // Get or create invoice number
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    const prefix = settings?.invoicePrefix || "INV";
    const nextNum = settings?.nextInvoiceNum || 1;
    const invoiceNumber = generateInvoiceNumber(prefix, nextNum);

    // Update the next invoice number
    if (settings) {
      await prisma.settings.update({
        where: { userId },
        data: { nextInvoiceNum: nextNum + 1 },
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        userId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        placeOfSupply: placeOfSupply || null,
        sellerState: sellerState || null,
        subtotal: parseFloat(subtotal) || 0,
        cgst: parseFloat(cgst) || 0,
        sgst: parseFloat(sgst) || 0,
        igst: parseFloat(igst) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || 0,
        status: status || "PENDING",
        notes: notes || null,
        template: template || "classic",
        items: {
          create: items.map((item: {
            productName: string;
            hsn?: string;
            quantity: number;
            price: number;
            discount?: number;
            gstRate?: number;
            total: number;
          }) => ({
            productName: item.productName,
            hsn: item.hsn || null,
            quantity: parseFloat(String(item.quantity)) || 1,
            price: parseFloat(String(item.price)) || 0,
            discount: parseFloat(String(item.discount)) || 0,
            gstRate: parseFloat(String(item.gstRate)) || 18,
            total: parseFloat(String(item.total)) || 0,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
