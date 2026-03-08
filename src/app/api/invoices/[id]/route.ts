import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId },
      include: {
        customer: true,
        items: true,
        user: {
          select: {
            businessName: true,
            gstin: true,
            address: true,
            phone: true,
            email: true,
            state: true,
            logo: true,
            signature: true,
            bankDetails: true,
            primaryColor: true,
            fontFamily: true,
            footerMessage: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // If only updating status
    if (body.status && Object.keys(body).length === 1) {
      const invoice = await prisma.invoice.update({
        where: { id: params.id },
        data: { status: body.status },
        include: { customer: true, items: true },
      });
      return NextResponse.json({ invoice });
    }

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

    // Delete existing items and create new ones
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id },
    });

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        customerId: customerId || existing.customerId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : existing.invoiceDate,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
        placeOfSupply: placeOfSupply !== undefined ? placeOfSupply : existing.placeOfSupply,
        sellerState: sellerState !== undefined ? sellerState : existing.sellerState,
        subtotal: subtotal !== undefined ? parseFloat(subtotal) : existing.subtotal,
        cgst: cgst !== undefined ? parseFloat(cgst) : existing.cgst,
        sgst: sgst !== undefined ? parseFloat(sgst) : existing.sgst,
        igst: igst !== undefined ? parseFloat(igst) : existing.igst,
        discount: discount !== undefined ? parseFloat(discount) : existing.discount,
        total: total !== undefined ? parseFloat(total) : existing.total,
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
        template: template || existing.template,
        items: items
          ? {
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
            }
          : undefined,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Update invoice error:", error);
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

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    await prisma.invoice.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Invoice deleted" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
