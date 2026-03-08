export interface InvoiceTemplateProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string | null;
    placeOfSupply: string | null;
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    discount: number;
    total: number;
    notes: string | null;
    customer: {
      name: string;
      gstin: string | null;
      address: string | null;
      phone: string | null;
      email: string | null;
      state: string | null;
    };
    items: Array<{
      id: string;
      productName: string;
      hsn: string | null;
      quantity: number;
      price: number;
      discount: number;
      gstRate: number;
      total: number;
    }>;
    user: {
      businessName: string | null;
      gstin: string | null;
      address: string | null;
      phone: string | null;
      email: string | null;
      state: string | null;
      logo: string | null;
      signature: string | null;
      bankDetails: string | null;
      primaryColor: string | null;
      fontFamily: string | null;
      footerMessage: string | null;
    };
  };
}
