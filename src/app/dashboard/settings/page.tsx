"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader2, Save, Upload } from "lucide-react";
import { INDIAN_STATES } from "@/lib/gst-calculator";

interface SettingsData {
  showDiscount: boolean;
  showHsn: boolean;
  showSignature: boolean;
  showBankDetails: boolean;
  showNotes: boolean;
  defaultTemplate: string;
  invoicePrefix: string;
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Business fields
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [logo, setLogo] = useState("");
  const [signature, setSignature] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [footerMessage, setFooterMessage] = useState("");

  // Settings
  const [settings, setSettings] = useState<SettingsData>({
    showDiscount: true,
    showHsn: true,
    showSignature: true,
    showBankDetails: true,
    showNotes: true,
    defaultTemplate: "classic",
    invoicePrefix: "INV",
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.user) {
        setBusinessName(data.user.businessName || "");
        setGstin(data.user.gstin || "");
        setAddress(data.user.address || "");
        setPhone(data.user.phone || "");
        setState(data.user.state || "");
        setLogo(data.user.logo || "");
        setSignature(data.user.signature || "");
        setBankDetails(data.user.bankDetails || "");
        setPrimaryColor(data.user.primaryColor || "#0f172a");
        setFontFamily(data.user.fontFamily || "Inter");
        setFooterMessage(data.user.footerMessage || "");
      }
      if (data.settings) {
        setSettings({
          showDiscount: data.settings.showDiscount ?? true,
          showHsn: data.settings.showHsn ?? true,
          showSignature: data.settings.showSignature ?? true,
          showBankDetails: data.settings.showBankDetails ?? true,
          showNotes: data.settings.showNotes ?? true,
          defaultTemplate: data.settings.defaultTemplate || "classic",
          invoicePrefix: data.settings.invoicePrefix || "INV",
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          gstin,
          address,
          phone,
          state,
          logo,
          signature,
          bankDetails,
          primaryColor,
          fontFamily,
          footerMessage,
          ...settings,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({ title: "Settings saved successfully!" });
      refreshUser();
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "signature"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (type === "logo") {
        setLogo(data.url);
      } else {
        setSignature(data.url);
      }
      toast({ title: `${type === "logo" ? "Logo" : "Signature"} uploaded!` });
    } catch {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your business profile and invoice settings</p>
      </div>

      {/* Business Details */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>Your business information appears on all invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>GSTIN</Label>
              <Input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the look and feel of your invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {logo && (
                  <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded-lg border" />
                )}
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-xl text-sm hover:bg-accent transition-colors">
                    <Upload className="h-4 w-4" />
                    {logo ? "Change" : "Upload"}
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "logo")}
                    disabled={uploading}
                  />
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Signature</Label>
              <div className="flex items-center gap-3">
                {signature && (
                  <img src={signature} alt="Signature" className="h-12 w-20 object-contain rounded-lg border" />
                )}
                <Label htmlFor="sig-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-xl text-sm hover:bg-accent transition-colors">
                    <Upload className="h-4 w-4" />
                    {signature ? "Change" : "Upload"}
                  </div>
                  <input
                    id="sig-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "signature")}
                    disabled={uploading}
                  />
                </Label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border cursor-pointer"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Add your bank details to display on invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
            placeholder={"Bank Name: State Bank of India\nAccount No: 1234567890\nIFSC: SBIN0001234\nBranch: Main Branch"}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Configure invoice defaults and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                placeholder="INV"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Template</Label>
              <Select
                value={settings.defaultTemplate}
                onValueChange={(v) => setSettings({ ...settings, defaultTemplate: v })}
              >
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

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Show/Hide Fields</h4>
            <div className="grid gap-4">
              {[
                { key: "showDiscount" as const, label: "Show Discount Column" },
                { key: "showHsn" as const, label: "Show HSN/SAC Code" },
                { key: "showSignature" as const, label: "Show Signature" },
                { key: "showBankDetails" as const, label: "Show Bank Details" },
                { key: "showNotes" as const, label: "Show Notes Section" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm">{label}</Label>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, [key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Message */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Footer Message</CardTitle>
          <CardDescription>This message appears at the bottom of your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={footerMessage}
            onChange={(e) => setFooterMessage(e.target.value)}
            placeholder="Thank you for your business! Terms & conditions apply."
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
