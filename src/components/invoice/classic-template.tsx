import React from "react";
import { InvoiceTemplateProps } from "./invoice-types";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

export function ClassicTemplate({ invoice }: InvoiceTemplateProps) {
  const { customer, items, user } = invoice;
  const isSameState = invoice.cgst > 0 || invoice.sgst > 0;

  return (
    <div className="p-8 min-h-[1100px]" style={{ fontFamily: user.fontFamily || "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6">
        <div>
          {user.logo && (
            <img src={user.logo} alt="Logo" className="h-16 mb-2 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{user.businessName || "Your Business"}</h1>
          {user.gstin && <p className="text-sm text-gray-600">GSTIN: {user.gstin}</p>}
          {user.address && <p className="text-sm text-gray-600">{user.address}</p>}
          {user.phone && <p className="text-sm text-gray-600">Phone: {user.phone}</p>}
          {user.email && <p className="text-sm text-gray-600">Email: {user.email}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold" style={{ color: user.primaryColor || "#1e293b" }}>
            TAX INVOICE
          </h2>
          <div className="mt-3 space-y-1 text-sm">
            <p><span className="text-gray-500">Invoice #:</span> <span className="font-semibold">{invoice.invoiceNumber}</span></p>
            <p><span className="text-gray-500">Date:</span> {dayjs(invoice.invoiceDate).format("DD MMM YYYY")}</p>
            {invoice.dueDate && (
              <p><span className="text-gray-500">Due Date:</span> {dayjs(invoice.dueDate).format("DD MMM YYYY")}</p>
            )}
            {invoice.placeOfSupply && (
              <p><span className="text-gray-500">Place of Supply:</span> {invoice.placeOfSupply}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mt-6 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="font-semibold text-gray-900">{customer.name}</p>
          {customer.gstin && <p className="text-sm text-gray-600">GSTIN: {customer.gstin}</p>}
          {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
          {customer.phone && <p className="text-sm text-gray-600">Phone: {customer.phone}</p>}
          {customer.state && <p className="text-sm text-gray-600">State: {customer.state}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-3 font-semibold">#</th>
              <th className="text-left py-3 font-semibold">Item</th>
              <th className="text-left py-3 font-semibold">HSN</th>
              <th className="text-right py-3 font-semibold">Qty</th>
              <th className="text-right py-3 font-semibold">Rate</th>
              <th className="text-right py-3 font-semibold">Disc%</th>
              <th className="text-right py-3 font-semibold">GST%</th>
              <th className="text-right py-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 text-gray-500">{index + 1}</td>
                <td className="py-3 font-medium">{item.productName}</td>
                <td className="py-3 text-gray-600">{item.hsn || "-"}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                <td className="py-3 text-right">{item.discount > 0 ? `${item.discount}%` : "-"}</td>
                <td className="py-3 text-right">{item.gstRate}%</td>
                <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-red-600">-{formatCurrency(invoice.discount)}</span>
            </div>
          )}
          {isSameState ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CGST</span>
                <span>{formatCurrency(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SGST</span>
                <span>{formatCurrency(invoice.sgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IGST</span>
              <span>{formatCurrency(invoice.igst)}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-800 pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      {user.bankDetails && (
        <div className="mt-8 p-4 bg-gray-50 rounded text-sm">
          <h4 className="font-semibold mb-1">Bank Details</h4>
          <p className="text-gray-600 whitespace-pre-line">{user.bankDetails}</p>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 text-sm">
          <h4 className="font-semibold mb-1">Notes</h4>
          <p className="text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Signature */}
      <div className="mt-12 flex justify-end">
        <div className="text-center">
          {user.signature && (
            <img src={user.signature} alt="Signature" className="h-16 mb-2 object-contain mx-auto" />
          )}
          <div className="border-t border-gray-400 pt-2 px-8">
            <p className="text-sm font-semibold">Authorized Signatory</p>
            <p className="text-xs text-gray-500">{user.businessName}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      {user.footerMessage && (
        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          {user.footerMessage}
        </div>
      )}
    </div>
  );
}
