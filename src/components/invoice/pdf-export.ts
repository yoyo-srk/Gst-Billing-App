import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdf(
  element: HTMLElement,
  invoiceNumber: string
): Promise<void> {
  // Wait for any images to load
  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  // If content is taller than A4, handle multiple pages
  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(pdfHeight * (Math.ceil(imgHeight / pdfHeight) - Math.ceil(heightLeft / pdfHeight)));
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  }

  const filename = `invoice-${invoiceNumber}.pdf`;
  pdf.save(filename);
}
