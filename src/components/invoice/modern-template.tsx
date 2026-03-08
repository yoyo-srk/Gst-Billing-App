import React from "react";
import { InvoiceTemplateProps } from "./invoice-types";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

export function ModernTemplate({ invoice }: InvoiceTemplateProps) {
  const { customer, items, user } = invoice;
  const primaryColor = user.primaryColor || "#0f172a";
  const isSameState = invoice.cgst > 0 || invoice.sgst > 0;

  return (
    <div className="min-h-[1100px]" style={{ fontFamily: user.fontFamily || "Inter, sans-serif" }}>
      {/* Header with colored bar */}
      <div className="p-8 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="flex justify-between items-start">
          <div>
            {user.logo && (
              <img src={user.logo} alt="Logo" className="h-14 mb-3 object-contain brightness-0 invert" />
            )}
            <h1 className="text-2xl font-bold">{user.businessName || "Your Business"}</h1>
            {user.gstin && <p className="text-sm opacity-80">GSTIN: {user.gstin}</p>}
            {user.address && <p className="text-sm opacity-80">{user.address}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold opacity-90">INVOICE</h2>
            <p className="text-lg font-semibold mt-2">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Invoice Info + Customer */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>
              Bill To
            </h3>
            <p className="font-semibold text-lg">{customer.name}</p>
            {customer.gstin && <p className="text-sm text-gray-600">GSTIN: {customer.gstin}</p>}
            {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
            {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
          </div>
          <div className="text-right space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Invoice Date</span>
              <p className="font-semibold">{dayjs(invoice.invoiceDate).format("DD MMM YYYY")}</p>
            </div>
            {invoice.dueDate && (
              <div>
                <span className="text-gray-500">Due Date</span>
                <p className="font-semibold">{dayjs(invoice.dueDate).format("DD MMM YYYY")}</p>
              </div>
            )}
            {invoice.placeOfSupply && (
              <div>
                <span className="text-gray-500">Place of Supply</span>
                <p className="font-semibold">{invoice.placeOfSupply}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr style={{ backgroundColor: primaryColor + "10" }}>
              <th className="text-left py-3 px-4 font-semibold rounded-l-lg">Item</th>
              <th className="text-left py-3 px-2 font-semibold">HSN</th>
              <th className="text-right py-3 px-2 font-semibold">Qty</th>
              <th className="text-right py-3 px-2 font-semibold">Rate</th>
              <th className="text-right py-3 px-2 font-semibold">GST%</th>
              <th className="text-right py-3 px-4 font-semibold rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">{item.productName}</td>
                <td className="py-3 px-2 text-gray-500">{item.hsn || "-"}</td>
                <td className="py-3 px-2 text-right">{item.quantity}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.price)}</td>
                <td className="py-3 px-2 text-right">{item.gstRate}%</td>
                <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-600">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              {isSameState ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CGST</span>
                    <span>{formatCurrency(invoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SGST</span>
                    <span>{formatCurrency(invoice.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-500">IGST</span>
                  <span>{formatCurrency(invoice.igst)}</span>
                </div>
              )}
            </div>
            <div
              className="mt-3 p-4 rounded-xl text-white flex justify-between text-lg font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details & Notes */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          {user.bankDetails && (
            <div className="text-sm">
              <h4 className="font-semibold mb-2" style={{ color: primaryColor }}>Bank Details</h4>
              <p className="text-gray-600 whitespace-pre-line">{user.bankDetails}</p>
            </div>
          )}
          {invoice.notes && (
            <div className="text-sm">
              <h4 className="font-semibold mb-2" style={{ color: primaryColor }}>Notes</h4>
              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-center">
            {user.signature && (
              <img src={user.signature} alt="Signature" className="h-16 mb-2 mx-auto object-contain" />
            )}
            <div className="border-t-2 pt-2 px-8" style={{ borderColor: primaryColor }}>
              <p className="text-sm font-semibold">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {user.footerMessage && (
          <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
            {user.footerMessage}
          </div>
        )}
      </div>
    </div>
  );
}
