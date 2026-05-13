"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, AlertTriangle, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { GST_RATES } from "@/lib/gst-calculator";

interface SizeVariant {
  id: string;
  size: string;
  stock: number;
  price: number | null;
}

interface Product {
  id: string;
  name: string;
  hsn: string | null;
  price: number;
  gstRate: number;
  category: string | null;
  stock: number;
  lowStockAlert: number;
  sizeVariants: SizeVariant[];
}

function getStockStatus(stock: number, threshold: number) {
  if (stock <= 0) return { color: "bg-red-500", text: "Out of Stock", badge: "destructive" as const };
  if (stock <= threshold) return { color: "bg-orange-500", text: "Low Stock", badge: "warning" as const };
  return { color: "bg-green-500", text: "In Stock", badge: "success" as const };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLowStock, setShowLowStock] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    hsn: "",
    price: "",
    gstRate: "18",
    category: "",
    stock: "0",
    lowStockAlert: "10",
  });

  const [sizeVariants, setSizeVariants] = useState<Array<{ size: string; stock: string; price: string }>>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (showLowStock) params.set("lowStock", "true");
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setCategories(data.categories || []);
    } catch {
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, showLowStock, page, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm({ name: "", hsn: "", price: "", gstRate: "18", category: "", stock: "0", lowStockAlert: "10" });
    setSizeVariants([]);
    setEditingProduct(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      hsn: product.hsn || "",
      price: String(product.price),
      gstRate: String(product.gstRate),
      category: product.category || "",
      stock: String(product.stock),
      lowStockAlert: String(product.lowStockAlert),
    });
    setSizeVariants(
      product.sizeVariants.map((sv) => ({
        size: sv.size,
        stock: String(sv.stock),
        price: sv.price ? String(sv.price) : "",
      }))
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Error", description: "Name and price are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sizeVariants: sizeVariants.filter((sv) => sv.size).map((sv) => ({
            size: sv.size,
            stock: parseInt(sv.stock) || 0,
            price: sv.price ? parseFloat(sv.price) : null,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({ title: editingProduct ? "Product updated" : "Product created" });
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export?type=products");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products-export.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Products exported successfully!" });
    } catch {
      toast({ title: "Error", description: "Failed to export", variant: "destructive" });
    }
  };

  const addSizeVariant = () => {
    setSizeVariants([...sizeVariants, { size: "", stock: "0", price: "" }]);
  };

  const removeSizeVariant = (index: number) => {
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  };

  const updateSizeVariant = (index: number, field: string, value: string) => {
    const updated = [...sizeVariants];
    updated[index] = { ...updated[index], [field]: value };
    setSizeVariants(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "destructive" : "outline"}
              size="sm"
              onClick={() => { setShowLowStock(!showLowStock); setPage(1); }}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {showLowStock ? "Show All" : "Low Stock"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search || categoryFilter !== "all" || showLowStock ? "No products found" : "No products yet. Add your first product!"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>GST Rate</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.lowStockAlert);
                    return (
                      <TableRow
                        key={product.id}
                        className={product.stock <= product.lowStockAlert ? "border-l-4 border-l-red-500" : ""}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.hsn || "-"}</TableCell>
                        <TableCell>{product.category || "-"}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{product.gstRate}%</TableCell>
                        <TableCell>
                          <span className={product.stock <= 0 ? "text-red-600 font-bold" : product.stock <= product.lowStockAlert ? "text-orange-600 font-semibold" : ""}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.badge}>
                            <span className={`inline-block w-2 h-2 rounded-full ${stockStatus.color} mr-1`} />
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.sizeVariants.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.sizeVariants.map((sv) => (
                                <Badge key={sv.id} variant="outline" className="text-xs">
                                  {sv.size}: {sv.stock}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div className="space-y-2">
                <Label>HSN/SAC Code</Label>
                <Input
                  value={form.hsn}
                  onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                  placeholder="e.g., 8471"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>GST Rate</Label>
                <Select value={form.gstRate} onValueChange={(v) => setForm({ ...form, gstRate: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Alert</Label>
                <Input
                  type="number"
                  value={form.lowStockAlert}
                  onChange={(e) => setForm({ ...form, lowStockAlert: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Size Variants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Size Variants</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSizeVariant}>
                  <Plus className="h-3 w-3 mr-1" /> Add Size
                </Button>
              </div>
              {sizeVariants.map((sv, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <Input
                      placeholder="Size (S, M, L...)"
                      value={sv.size}
                      onChange={(e) => updateSizeVariant(index, "size", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={sv.stock}
                      onChange={(e) => updateSizeVariant(index, "stock", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price (optional)"
                      value={sv.price}
                      onChange={(e) => updateSizeVariant(index, "price", e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSizeVariant(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
