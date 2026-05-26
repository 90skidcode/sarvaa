import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order: any) => {
  const doc = new jsPDF();

  // Branding
  doc.setFontSize(24);
  doc.setTextColor(116, 49, 129); // #743181 - Sarvaa Purple
  doc.setFont("helvetica", "bold");
  doc.text("SARVAA SWEETS", 105, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Traditional Sweets & Savories", 105, 32, {
    align: "center",
  });

  // Separator line
  doc.setDrawColor(200);
  doc.line(20, 40, 190, 40);

  // Invoice Details Header
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 20, 55);

  // Order Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Invoice No: ${order.orderNumber}`, 20, 65);
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    20,
    71,
  );
  doc.text(`Order Status: ${order.status.toUpperCase()}`, 20, 77);
  doc.text(`Payment: ${order.paymentMethod || "Paid"}`, 20, 83);

  // Customer Details
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("BILL TO:", 120, 65);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  const customerName = order.name || order.user?.name || "Valued Customer";
  doc.text(customerName, 120, 71);
  doc.text(`Phone: ${order.phone || order.user?.phone || "N/A"}`, 120, 77);
  doc.text(`Email: ${order.email || order.user?.email || "N/A"}`, 120, 83);

  const address = order.address || "N/A";
  const splitAddress = doc.splitTextToSize(address, 70);
  doc.text(splitAddress, 120, 89);

  // Table of Items
  const tableRows = order.items.map((item: any) => [
    item.product?.name || "Unknown Item",
    item.weight || "-",
    item.quantity,
    `INR ${item.price.toFixed(2)}`,
    `INR ${(item.price * item.quantity).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 110,
    head: [["Product", "Weight", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    headStyles: {
      fillColor: [116, 49, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [250, 245, 252],
    },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("Subtotal:", 130, finalY);
  doc.text(`INR ${order.total.toFixed(2)}`, 190, finalY, { align: "right" });

  if (order.discountAmount > 0) {
    doc.text("Discount:", 130, finalY + 7);
    doc.text(`- INR ${order.discountAmount.toFixed(2)}`, 190, finalY + 7, {
      align: "right",
    });
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(116, 49, 129);
  doc.text("GRAND TOTAL:", 130, finalY + 15);
  doc.text(`INR ${order.total.toFixed(2)}`, 190, finalY + 15, {
    align: "right",
  });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text(
    "This is a computer generated invoice and does not require a physical signature.",
    105,
    275,
    { align: "center" },
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(116, 49, 129);
  doc.text("Thank you for your sweetness!", 105, 285, { align: "center" });

  doc.save(`Sarvaa_Invoice_${order.orderNumber}.pdf`);
};
