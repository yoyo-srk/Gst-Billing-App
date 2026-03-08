import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Shield, Zap, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">GST Bill</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <span className="text-muted-foreground">GST Compliant Invoicing</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Professional GST Billing
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create beautiful, GST-compliant invoices in seconds. Automatic tax calculations,
            multiple templates, and PDF export. Everything you need to manage your billing.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">GST Compliant</h3>
            <p className="text-muted-foreground">
              Automatic CGST, SGST, and IGST calculations based on place of supply.
              Fully compliant with Indian GST regulations.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Beautiful Templates</h3>
            <p className="text-muted-foreground">
              Choose from Classic, Modern, Minimal, or Retail POS templates.
              Customize colors, fonts, and layout to match your brand.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">PDF Export</h3>
            <p className="text-muted-foreground">
              Export professional A4-sized invoices as high-resolution PDFs.
              Print-ready with clean margins and no UI elements.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GST Bill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
