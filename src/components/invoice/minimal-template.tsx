import React from "react";
import { InvoiceTemplateProps } from "./invoice-types";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

export function MinimalTemplate({ invoice }: InvoiceTemplateProps) {
  const { customer, items, user } = invoice;
  const isSameState = invoice.cgst > 0 || invoice.sgst > 0;

  return (
    <div className="p-10 min-h-[1100px]" style={{ fontFamily: user.fontFamily || "Inter, sans-serif" }}>
      {/* Header - Simple and Clean */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-xl font-medium text-gray-900">{user.businessName || "Your Business"}</h1>
          {user.gstin && <p className="text-xs text-gray-400 mt-1">GSTIN: {user.gstin}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Invoice</p>
          <p className="text-sm font-medium mt-1">{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-8 mb-10 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
          <p className="font-medium">{customer.name}</p>
          {customer.gstin && <p className="text-gray-500 text-xs mt-1">GSTIN: {customer.gstin}</p>}
          {customer.address && <p className="text-gray-500 text-xs">{customer.address}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Invoice Date</p>
          <p className="font-medium">{dayjs(invoice.invoiceDate).format("DD MMM YYYY")}</p>
          {invoice.dueDate && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-4 mb-2">Due Date</p>
              <p className="font-medium">{dayjs(invoice.dueDate).format("DD MMM YYYY")}</p>
            </>
          )}
        </div>
        <div>
          {invoice.placeOfSupply && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Place of Supply</p>
              <p className="font-medium">{invoice.placeOfSupply}</p>
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Description</th>
            <th className="text-right py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Qty</th>
            <th className="text-right py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Rate</th>
            <th className="text-right py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">GST</th>
            <th className="text-right py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-4">
                <p className="font-medium">{item.productName}</p>
                {item.hsn && <p className="text-xs text-gray-400">HSN: {item.hsn}</p>}
              </td>
              <td className="py-4 text-right text-gray-600">{item.quantity}</td>
              <td className="py-4 text-right text-gray-600">{formatCurrency(item.price)}</td>
              <td className="py-4 text-right text-gray-600">{item.gstRate}%</td>
              <td className="py-4 text-right font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Discount</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
          )}
          {isSameState ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">CGST</span>
                <span>{formatCurrency(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SGST</span>
                <span>{formatCurrency(invoice.sgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-400">IGST</span>
              <span>{formatCurrency(invoice.igst)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer area */}
      <div className="mt-16 space-y-6">
        {invoice.notes && (
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Notes</p>
            {invoice.notes}
          </div>
        )}
        {user.bankDetails && (
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Payment Details</p>
            <p className="whitespace-pre-line">{user.bankDetails}</p>
          </div>
        )}
        <div className="flex justify-end mt-12">
          <div className="text-center">
            {user.signature && (
              <img src={user.signature} alt="Signature" className="h-12 mb-2 mx-auto object-contain" />
            )}
            <div className="border-t pt-2 px-6">
              <p className="text-xs text-gray-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {user.footerMessage && (
        <div className="mt-8 text-center text-[10px] text-gray-300">
          {user.footerMessage}
        </div>
      )}
    </div>
  );
}
