export interface InvoiceItemInput {
  productName: string;
  hsn?: string;
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
}

export interface TaxBreakdown {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  itemTotals: number[];
}

export function calculateItemTotal(item: InvoiceItemInput): number {
  const gross = item.quantity * item.price;
  const discountAmount = (gross * item.discount) / 100;
  return gross - discountAmount;
}

export function calculateGST(
  items: InvoiceItemInput[],
  isSameState: boolean
): TaxBreakdown {
  let subtotal = 0;
  let totalDiscount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  const itemTotals: number[] = [];

  for (const item of items) {
    const gross = item.quantity * item.price;
    const discountAmount = (gross * item.discount) / 100;
    const taxableAmount = gross - discountAmount;

    subtotal += gross;
    totalDiscount += discountAmount;
    itemTotals.push(taxableAmount);

    if (isSameState) {
      cgst += (taxableAmount * item.gstRate) / 100 / 2;
      sgst += (taxableAmount * item.gstRate) / 100 / 2;
    } else {
      igst += (taxableAmount * item.gstRate) / 100;
    }
  }

  const taxableAmount = subtotal - totalDiscount;
  const totalTax = cgst + sgst + igst;
  const total = taxableAmount + totalTax;

  return {
    subtotal,
    totalDiscount,
    taxableAmount,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemTotals,
  };
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const GST_RATES = [0, 5, 12, 18, 28];
