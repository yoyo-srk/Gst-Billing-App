"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { calculateGST, INDIAN_STATES, GST_RATES } from "@/lib/gst-calculator";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

interface Customer {
  id: string;
  name: string;
  gstin: string | null;
  state: string | null;
}

interface Product {
  id: string;
  name: string;
  hsn: string | null;
  price: number;
  gstRate: number;
}

interface InvoiceItem {
  productName: string;
  hsn: string;
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dueDate, setDueDate] = useState(dayjs().add(30, "day").format("YYYY-MM-DD"));
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [notes, setNotes] = useState("");
  const [template, setTemplate] = useState("classic");

  const [items, setItems] = useState<InvoiceItem[]>([
    { productName: "", hsn: "", quantity: 1, price: 0, discount: 0, gstRate: 18 },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/products"),
      ]);
      const custData = await custRes.json();
      const prodData = await prodRes.json();
      setCustomers(custData.customers || []);
      setProducts(prodData.products || []);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const sellerState = user?.state || "";
  const isSameState =
    sellerState && placeOfSupply
      ? sellerState.toLowerCase() === placeOfSupply.toLowerCase()
      : true;

  const taxBreakdown = calculateGST(items, isSameState);

  const addItem = () => {
    setItems([
      ...items,
      { productName: "", hsn: "", quantity: 1, price: 0, discount: 0, gstRate: 18 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productName: product.name,
      hsn: product.hsn || "",
      price: product.price,
      gstRate: product.gstRate,
    };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }
    if (items.some((item) => !item.productName || item.price <= 0)) {
      toast({
        title: "Error",
        description: "All items must have a name and price",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const itemsWithTotals = items.map((item, idx) => ({
        ...item,
        total: taxBreakdown.itemTotals[idx] || 0,
      }));

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          invoiceDate,
          dueDate,
          placeOfSupply,
          sellerState,
          subtotal: taxBreakdown.subtotal,
          cgst: taxBreakdown.cgst,
          sgst: taxBreakdown.sgst,
          igst: taxBreakdown.igst,
          discount: taxBreakdown.totalDiscount,
          total: taxBreakdown.total,
          notes,
          template,
          items: itemsWithTotals,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const data = await res.json();
      toast({ title: "Invoice created successfully!" });
      router.push(`/dashboard/invoices/${data.invoice.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create invoice";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Fill in the details to generate a GST invoice</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Customer *</Label>
                <Select value={customerId} onValueChange={(v) => {
                  setCustomerId(v);
                  const cust = customers.find((c) => c.id === v);
                  if (cust?.state) setPlaceOfSupply(cust.state);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.gstin ? `(${c.gstin})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCustomer && (
                <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Name:</span> {selectedCustomer.name}</p>
                  {selectedCustomer.gstin && (
                    <p><span className="text-muted-foreground">GSTIN:</span> {selectedCustomer.gstin}</p>
                  )}
                  {selectedCustomer.state && (
                    <p><span className="text-muted-foreground">State:</span> {selectedCustomer.state}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Place of Supply</Label>
                  <Select value={placeOfSupply} onValueChange={setPlaceOfSupply}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="retail">Retail POS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Item {index + 1}
                      </span>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs">Product</Label>
                        <Select onValueChange={(v) => selectProduct(index, v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product or type below" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} - {formatCurrency(p.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Product Name *</Label>
                        <Input
                          value={item.productName}
                          onChange={(e) => updateItem(index, "productName", e.target.value)}
                          placeholder="Product name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">HSN/SAC Code</Label>
                        <Input
                          value={item.hsn}
                          onChange={(e) => updateItem(index, "hsn", e.target.value)}
                          placeholder="HSN Code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItem(index, "discount", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">GST %</Label>
                        <Select
                          value={String(item.gstRate)}
                          onValueChange={(v) => updateItem(index, "gstRate", parseFloat(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map((rate) => (
                              <SelectItem key={rate} value={String(rate)}>
                                {rate}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-muted-foreground">Line Total: </span>
                      <span className="font-semibold">
                        {formatCurrency(taxBreakdown.itemTotals[index] || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or terms & conditions..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(taxBreakdown.subtotal)}</span>
              </div>
              {taxBreakdown.totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatCurrency(taxBreakdown.totalDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span>{formatCurrency(taxBreakdown.taxableAmount)}</span>
              </div>
              {isSameState ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST</span>
                    <span>{formatCurrency(taxBreakdown.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST</span>
                    <span>{formatCurrency(taxBreakdown.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGST</span>
                  <span>{formatCurrency(taxBreakdown.igst)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(taxBreakdown.total)}</span>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full gap-2" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
