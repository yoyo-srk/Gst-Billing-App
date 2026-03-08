import React from "react";
import { InvoiceTemplateProps } from "./invoice-types";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

export function RetailTemplate({ invoice }: InvoiceTemplateProps) {
  const { customer, items, user } = invoice;
  const isSameState = invoice.cgst > 0 || invoice.sgst > 0;

  return (
    <div
      className="p-6 max-w-[400px] mx-auto min-h-[600px]"
      style={{ fontFamily: "monospace" }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-800 pb-4 mb-4">
        <h1 className="text-lg font-bold">{user.businessName || "Your Business"}</h1>
        {user.address && <p className="text-xs">{user.address}</p>}
        {user.phone && <p className="text-xs">Tel: {user.phone}</p>}
        {user.gstin && <p className="text-xs">GSTIN: {user.gstin}</p>}
      </div>

      {/* Invoice Info */}
      <div className="text-xs space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Invoice #</span>
          <span className="font-bold">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>{dayjs(invoice.invoiceDate).format("DD/MM/YYYY HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer</span>
          <span>{customer.name}</span>
        </div>
        {customer.gstin && (
          <div className="flex justify-between">
            <span>GSTIN</span>
            <span>{customer.gstin}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-800 my-2" />

      {/* Items */}
      <div className="text-xs space-y-2 mb-4">
        <div className="flex justify-between font-bold">
          <span className="flex-1">Item</span>
          <span className="w-8 text-right">Qty</span>
          <span className="w-16 text-right">Rate</span>
          <span className="w-16 text-right">Amt</span>
        </div>
        <div className="border-t border-dashed border-gray-400" />
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <span className="flex-1 truncate">{item.productName}</span>
              <span className="w-8 text-right">{item.quantity}</span>
              <span className="w-16 text-right">{item.price.toFixed(2)}</span>
              <span className="w-16 text-right">{item.total.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-gray-500 ml-2">
              {item.hsn && `HSN:${item.hsn} `}GST:{item.gstRate}%
              {item.discount > 0 && ` Disc:${item.discount}%`}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-dashed border-gray-800 my-2" />

      {/* Totals */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{invoice.subtotal.toFixed(2)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{invoice.discount.toFixed(2)}</span>
          </div>
        )}
        {isSameState ? (
          <>
            <div className="flex justify-between">
              <span>CGST</span>
              <span>{invoice.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST</span>
              <span>{invoice.sgst.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span>IGST</span>
            <span>{invoice.igst.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-dashed border-gray-800 my-1" />
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-800 my-4" />

      {/* Footer */}
      <div className="text-center text-xs space-y-2">
        {invoice.notes && <p className="text-gray-600">{invoice.notes}</p>}
        <p className="font-bold">Thank you for your business!</p>
        {user.footerMessage && (
          <p className="text-[10px] text-gray-400">{user.footerMessage}</p>
        )}
      </div>
    </div>
  );
}
