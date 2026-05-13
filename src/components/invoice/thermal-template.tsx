"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

interface ThermalTemplateProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    discount: number;
    total: number;
    notes: string | null;
    customer: {
      name: string;
      phone: string | null;
      address: string | null;
    };
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      discount: number;
      gstRate: number;
      total: number;
      size?: string | null;
    }>;
    user: {
      businessName: string | null;
      phone: string | null;
      address: string | null;
      gstin: string | null;
    };
  };
}

export function ThermalTemplate({ invoice }: ThermalTemplateProps) {
  const DottedSeparator = () => (
    <div className="w-full border-b border-dotted border-gray-400 my-2" />
  );

  return (
    <div
      className="bg-white text-black p-4 font-sans text-sm"
      style={{ width: "300px", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Business Header */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold">{invoice.user.businessName || "Business"}</h2>
        {invoice.user.address && (
          <p className="text-xs">{invoice.user.address}</p>
        )}
        {invoice.user.phone && (
          <p className="text-xs">Tel: {invoice.user.phone}</p>
        )}
        {invoice.user.gstin && (
          <p className="text-xs font-medium">GSTIN: {invoice.user.gstin}</p>
        )}
      </div>

      <DottedSeparator />

      {/* Invoice Info */}
      <div className="text-xs space-y-0.5">
        <div className="flex justify-between">
          <span>Bill No:</span>
          <span className="font-medium">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{dayjs(invoice.invoiceDate).format("DD/MM/YYYY HH:mm")}</span>
        </div>
      </div>

      <DottedSeparator />

      {/* Customer Info */}
      {invoice.customer.name && (
        <>
          <div className="text-xs space-y-0.5">
            <p>Customer: {invoice.customer.name}</p>
            {invoice.customer.phone && <p>Phone: {invoice.customer.phone}</p>}
          </div>
          <DottedSeparator />
        </>
      )}

      {/* Items Header */}
      <div className="text-xs font-bold flex justify-between">
        <span className="flex-1">Item</span>
        <span className="w-8 text-center">Qty</span>
        <span className="w-16 text-right">Rate</span>
        <span className="w-16 text-right">Amt</span>
      </div>

      <DottedSeparator />

      {/* Items */}
      <div className="space-y-1">
        {invoice.items.map((item, idx) => (
          <div key={idx} className="text-xs">
            <div className="flex justify-between">
              <span className="flex-1 truncate">
                {item.productName}
                {item.size ? ` (${item.size})` : ""}
              </span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-16 text-right">{formatCurrency(item.price)}</span>
              <span className="w-16 text-right">{formatCurrency(item.total)}</span>
            </div>
            {item.discount > 0 && (
              <p className="text-[10px] text-gray-500 ml-2">Disc: {item.discount}%</p>
            )}
          </div>
        ))}
      </div>

      <DottedSeparator />

      {/* Totals */}
      <div className="text-xs space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        {invoice.cgst > 0 && (
          <div className="flex justify-between">
            <span>CGST:</span>
            <span>{formatCurrency(invoice.cgst)}</span>
          </div>
        )}
        {invoice.sgst > 0 && (
          <div className="flex justify-between">
            <span>SGST:</span>
            <span>{formatCurrency(invoice.sgst)}</span>
          </div>
        )}
        {invoice.igst > 0 && (
          <div className="flex justify-between">
            <span>IGST:</span>
            <span>{formatCurrency(invoice.igst)}</span>
          </div>
        )}
        {invoice.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(invoice.discount)}</span>
          </div>
        )}
      </div>

      <DottedSeparator />

      {/* Grand Total */}
      <div className="flex justify-between text-base font-bold">
        <span>TOTAL:</span>
        <span>{formatCurrency(invoice.total)}</span>
      </div>

      <DottedSeparator />

      {/* Footer */}
      <div className="text-center text-xs mt-2 space-y-1">
        {invoice.notes && <p>{invoice.notes}</p>}
        <p className="font-medium">Thank you for your purchase!</p>
        <p className="text-[10px] text-gray-500">Powered by GST Bill</p>
      </div>
    </div>
  );
}
