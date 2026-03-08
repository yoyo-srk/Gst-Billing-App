"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { ClassicTemplate } from "@/components/invoice/classic-template";
import { ModernTemplate } from "@/components/invoice/modern-template";
import { MinimalTemplate } from "@/components/invoice/minimal-template";
import { RetailTemplate } from "@/components/invoice/retail-template";
import { generatePdf } from "@/components/invoice/pdf-export";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  placeOfSupply: string | null;
  sellerState: string | null;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  total: number;
  status: string;
  notes: string | null;
  template: string;
  customer: {
    name: string;
    gstin: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    state: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    hsn: string | null;
    quantity: number;
    price: number;
    discount: number;
    gstRate: number;
    total: number;
  }>;
  user: {
    businessName: string | null;
    gstin: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    state: string | null;
    logo: string | null;
    signature: string | null;
    bankDetails: string | null;
    primaryColor: string | null;
    fontFamily: string | null;
    footerMessage: string | null;
  };
}

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "default",
};

export default function InvoiceViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setInvoice(data.invoice);
        setSelectedTemplate(data.invoice.template || "classic");
      } catch {
        toast({ title: "Error", description: "Failed to load invoice", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.id, toast]);

  useEffect(() => {
    if (invoice && searchParams.get("download") === "true") {
      handleDownload();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, searchParams]);

  const handleDownload = async () => {
    if (!invoiceRef.current || !invoice) return;
    setDownloading(true);
    try {
      await generatePdf(invoiceRef.current, invoice.invoiceNumber);
      toast({ title: "PDF downloaded successfully!" });
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setInvoice({ ...invoice, status: newStatus });
      toast({ title: `Invoice marked as ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Invoice not found</p>
        <Link href="/dashboard/invoices">
          <Button variant="link">Back to invoices</Button>
        </Link>
      </div>
    );
  }

  const templateProps = { invoice };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "modern":
        return <ModernTemplate {...templateProps} />;
      case "minimal":
        return <MinimalTemplate {...templateProps} />;
      case "retail":
        return <RetailTemplate {...templateProps} />;
      default:
        return <ClassicTemplate {...templateProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <Badge variant={statusColors[invoice.status] || "default"} className="mt-1">
              {invoice.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="retail">Retail POS</SelectItem>
            </SelectContent>
          </Select>
          <Select value={invoice.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="shadow-lg overflow-hidden">
        <div ref={invoiceRef} className="bg-white text-black">
          {renderTemplate()}
        </div>
      </Card>
    </div>
  );
}
