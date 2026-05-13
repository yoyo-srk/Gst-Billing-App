"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, FileText, Clock, TrendingUp, Package, AlertTriangle, IndianRupee } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import Link from "next/link";

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customer: { name: string };
}

interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  pendingPayments: number;
  totalCustomers: number;
  totalProducts: number;
  totalAmount: number;
  totalGST: number;
  lowStockProducts: number;
  recentInvoices: RecentInvoice[];
  monthlyData: Array<{
    month: string;
    revenue: number;
    invoices: number;
  }>;
}

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "default",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const widgets = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Total Invoices",
      value: String(stats?.totalInvoices || 0),
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(stats?.pendingPayments || 0),
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Total Customers",
      value: String(stats?.totalCustomers || 0),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Total Amount (Incl. GST)",
      value: formatCurrency(stats?.totalAmount || 0),
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Total GST Collected",
      value: formatCurrency(stats?.totalGST || 0),
      icon: IndianRupee,
      color: "text-cyan-600",
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      title: "Total Products",
      value: String(stats?.totalProducts || 0),
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Low Stock Items",
      value: String(stats?.lowStockProducts || 0),
      icon: AlertTriangle,
      color: stats?.lowStockProducts ? "text-red-600" : "text-gray-600",
      bg: stats?.lowStockProducts
        ? "bg-red-100 dark:bg-red-900/30"
        : "bg-gray-100 dark:bg-gray-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your billing activity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => (
          <Card key={widget.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{widget.title}</p>
                  <p className="text-2xl font-bold mt-1">{widget.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${widget.bg} flex items-center justify-center`}>
                  <widget.icon className={`h-6 w-6 ${widget.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Sales Chart */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bills */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                stats.recentInvoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/dashboard/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium font-mono">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{inv.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(inv.createdAt).format("DD MMM YYYY")}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                      <Badge variant={statusColors[inv.status] || "default"} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent bills
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
