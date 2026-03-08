import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
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
      }),
      prisma.settings.findUnique({ where: { userId } }),
    ]);

    return NextResponse.json({ user, settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      gstin,
      address,
      phone,
      state,
      logo,
      signature,
      bankDetails,
      primaryColor,
      fontFamily,
      footerMessage,
      showDiscount,
      showHsn,
      showSignature,
      showBankDetails,
      showNotes,
      defaultTemplate,
      invoicePrefix,
    } = body;

    await prisma.user.update({
      where: { id: userId },
      data: {
        businessName: businessName !== undefined ? businessName : undefined,
        gstin: gstin !== undefined ? gstin : undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        state: state !== undefined ? state : undefined,
        logo: logo !== undefined ? logo : undefined,
        signature: signature !== undefined ? signature : undefined,
        bankDetails: bankDetails !== undefined ? bankDetails : undefined,
        primaryColor: primaryColor !== undefined ? primaryColor : undefined,
        fontFamily: fontFamily !== undefined ? fontFamily : undefined,
        footerMessage: footerMessage !== undefined ? footerMessage : undefined,
      },
    });

    // Upsert settings
    await prisma.settings.upsert({
      where: { userId },
      create: {
        userId,
        showDiscount: showDiscount ?? true,
        showHsn: showHsn ?? true,
        showSignature: showSignature ?? true,
        showBankDetails: showBankDetails ?? true,
        showNotes: showNotes ?? true,
        defaultTemplate: defaultTemplate || "classic",
        invoicePrefix: invoicePrefix || "INV",
      },
      update: {
        showDiscount: showDiscount !== undefined ? showDiscount : undefined,
        showHsn: showHsn !== undefined ? showHsn : undefined,
        showSignature: showSignature !== undefined ? showSignature : undefined,
        showBankDetails: showBankDetails !== undefined ? showBankDetails : undefined,
        showNotes: showNotes !== undefined ? showNotes : undefined,
        defaultTemplate: defaultTemplate !== undefined ? defaultTemplate : undefined,
        invoicePrefix: invoicePrefix !== undefined ? invoicePrefix : undefined,
      },
    });

    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
