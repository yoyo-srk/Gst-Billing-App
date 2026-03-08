import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@gstbill.com" },
    update: {},
    create: {
      email: "demo@gstbill.com",
      password: hashedPassword,
      businessName: "Acme Technologies Pvt. Ltd.",
      gstin: "27AADCA1234F1ZR",
      address: "123 Business Park, Andheri East, Mumbai, Maharashtra - 400069",
      phone: "+91 9876543210",
      state: "Maharashtra",
      primaryColor: "#0f172a",
      fontFamily: "Inter",
      footerMessage: "Thank you for your business! Payment is due within 30 days.",
      bankDetails:
        "Bank: State Bank of India\nAccount No: 38762145890\nIFSC: SBIN0001234\nBranch: Andheri East, Mumbai",
      settings: {
        create: {
          showDiscount: true,
          showHsn: true,
          showSignature: true,
          showBankDetails: true,
          showNotes: true,
          defaultTemplate: "classic",
          invoicePrefix: "INV",
          nextInvoiceNum: 5,
        },
      },
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "TechCorp Solutions",
        gstin: "29BBDCS5678G1ZT",
        address: "456 Tech Hub, Koramangala, Bangalore, Karnataka - 560034",
        phone: "+91 9876501234",
        email: "billing@techcorp.com",
        state: "Karnataka",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Global Traders",
        gstin: "27CCFGT9012H1ZU",
        address: "789 Market Road, Fort, Mumbai, Maharashtra - 400001",
        phone: "+91 9876505678",
        email: "accounts@globaltraders.in",
        state: "Maharashtra",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Delhi Enterprises",
        gstin: "07DDEEE3456I1ZV",
        address: "321 Connaught Place, New Delhi - 110001",
        phone: "+91 9876509012",
        email: "info@delhient.com",
        state: "Delhi",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Southern Spices Ltd.",
        gstin: "33EEFSS7890J1ZW",
        address: "567 Spice Garden, T Nagar, Chennai, Tamil Nadu - 600017",
        phone: "+91 9876503456",
        email: "orders@southernspices.com",
        state: "Tamil Nadu",
        userId: user.id,
      },
    }),
  ]);

  console.log(`Created ${customers.length} customers`);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Web Development Service",
        hsn: "998314",
        price: 50000,
        gstRate: 18,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Mobile App Development",
        hsn: "998314",
        price: 75000,
        gstRate: 18,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "UI/UX Design Package",
        hsn: "998396",
        price: 25000,
        gstRate: 18,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cloud Hosting (Annual)",
        hsn: "998315",
        price: 12000,
        gstRate: 18,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "SEO Services",
        hsn: "998366",
        price: 15000,
        gstRate: 18,
        userId: user.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Laptop - ThinkPad X1",
        hsn: "8471",
        price: 95000,
        gstRate: 18,
        userId: user.id,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-20260301-0001",
      customerId: customers[0].id,
      userId: user.id,
      invoiceDate: new Date("2026-03-01"),
      dueDate: new Date("2026-03-31"),
      placeOfSupply: "Karnataka",
      sellerState: "Maharashtra",
      subtotal: 125000,
      cgst: 0,
      sgst: 0,
      igst: 22500,
      discount: 0,
      total: 147500,
      status: "PAID",
      template: "classic",
      notes: "Payment received via bank transfer. Thank you!",
      items: {
        create: [
          {
            productName: "Web Development Service",
            hsn: "998314",
            quantity: 1,
            price: 50000,
            discount: 0,
            gstRate: 18,
            total: 50000,
          },
          {
            productName: "Mobile App Development",
            hsn: "998314",
            quantity: 1,
            price: 75000,
            discount: 0,
            gstRate: 18,
            total: 75000,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-20260305-0002",
      customerId: customers[1].id,
      userId: user.id,
      invoiceDate: new Date("2026-03-05"),
      dueDate: new Date("2026-04-04"),
      placeOfSupply: "Maharashtra",
      sellerState: "Maharashtra",
      subtotal: 25000,
      cgst: 2250,
      sgst: 2250,
      igst: 0,
      discount: 0,
      total: 29500,
      status: "PENDING",
      template: "modern",
      notes: "Payment due within 30 days.",
      items: {
        create: [
          {
            productName: "UI/UX Design Package",
            hsn: "998396",
            quantity: 1,
            price: 25000,
            discount: 0,
            gstRate: 18,
            total: 25000,
          },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-20260307-0003",
      customerId: customers[2].id,
      userId: user.id,
      invoiceDate: new Date("2026-03-07"),
      dueDate: new Date("2026-04-06"),
      placeOfSupply: "Delhi",
      sellerState: "Maharashtra",
      subtotal: 190000,
      cgst: 0,
      sgst: 0,
      igst: 34200,
      discount: 0,
      total: 224200,
      status: "PENDING",
      template: "minimal",
      items: {
        create: [
          {
            productName: "Laptop - ThinkPad X1",
            hsn: "8471",
            quantity: 2,
            price: 95000,
            discount: 0,
            gstRate: 18,
            total: 190000,
          },
        ],
      },
    },
  });

  const invoice4 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-20260208-0004",
      customerId: customers[3].id,
      userId: user.id,
      invoiceDate: new Date("2026-02-08"),
      dueDate: new Date("2026-03-08"),
      placeOfSupply: "Tamil Nadu",
      sellerState: "Maharashtra",
      subtotal: 27000,
      cgst: 0,
      sgst: 0,
      igst: 4860,
      discount: 0,
      total: 31860,
      status: "OVERDUE",
      template: "classic",
      items: {
        create: [
          {
            productName: "Cloud Hosting (Annual)",
            hsn: "998315",
            quantity: 1,
            price: 12000,
            discount: 0,
            gstRate: 18,
            total: 12000,
          },
          {
            productName: "SEO Services",
            hsn: "998366",
            quantity: 1,
            price: 15000,
            discount: 0,
            gstRate: 18,
            total: 15000,
          },
        ],
      },
    },
  });

  console.log(`Created 4 invoices`);
  console.log("\nSeed completed!");
  console.log("\nDemo credentials:");
  console.log("  Email: demo@gstbill.com");
  console.log("  Password: demo123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
