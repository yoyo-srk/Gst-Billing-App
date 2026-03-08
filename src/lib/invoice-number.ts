import dayjs from "dayjs";

export function generateInvoiceNumber(
  prefix: string = "INV",
  sequence: number = 1
): string {
  const dateStr = dayjs().format("YYYYMMDD");
  const seqStr = String(sequence).padStart(4, "0");
  return `${prefix}-${dateStr}-${seqStr}`;
}
