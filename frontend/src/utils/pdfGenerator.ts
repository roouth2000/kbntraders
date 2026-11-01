import { jsPDF } from 'jspdf';
import { Customer, CustomerLedgerRow } from '../types';
import { formatCurrency, formatDate } from './formatters';

export function generateInvoicePDF(invoice: any, companyName = 'KBN Traders'): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Accent Header Banner (Teal #0d9488)
  doc.setFillColor(13, 148, 136); // Teal 600
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Secondary subtle accent line
  doc.setFillColor(45, 212, 191); // Teal 400
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PRODUCE TAX INVOICE', pageWidth - 14, 15, { align: 'right' });

  // Reset text color to dark slate
  doc.setTextColor(30, 41, 59);

  // Invoice Number & Meta
  let y = 38;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const invNum = invoice.invoiceNumber || invoice.invoice_number || 'INV-000';
  doc.text(invNum, 14, y);

  // Status Badge
  const status = invoice.status || 'Pending';
  const statusColor = status === 'Paid' ? [16, 185, 129] : status === 'Partial' ? [14, 165, 233] : [245, 158, 11];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 36, y - 5, 22, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(status.toUpperCase(), pageWidth - 25, y - 0.5, { align: 'center' });

  // Dates
  y += 7;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date: ${formatDate(invoice.date)}`, 14, y);
  doc.text(`Payment Mode: ${invoice.paymentMode || invoice.payment_mode || 'Cash'}`, 14, y + 5);

  // Two Column Information: From / Bill To
  y += 15;
  const colWidth = (pageWidth - 28) / 2;

  // Box 1: Billed From (KBN Traders)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, colWidth - 4, 30, 2, 2, 'F');
  doc.setTextColor(13, 148, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILLED FROM (ISSUER)', 18, y + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(companyName, 18, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Wholesale Multi-Variety Trading & Produce Mandi', 18, y + 17);
  doc.text('Phone: +91 98765 43210 | GSTIN: 29AABCK1234F1Z5', 18, y + 21);
  doc.text('APMC Yard, Bengaluru, Karnataka, India', 18, y + 25);

  // Box 2: Billed To (Customer)
  const col2X = 14 + colWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X, y, colWidth - 4, 30, 2, 2, 'F');
  doc.setTextColor(13, 148, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILLED TO (CUSTOMER)', col2X + 4, y + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  const custName = invoice.partyName || invoice.customer_name || 'Customer';
  doc.text(custName, col2X + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const custPhone = invoice.partyPhone || invoice.customer_phone || 'Phone: Not provided';
  doc.text(`Phone: ${custPhone}`, col2X + 4, y + 17);
  const custAddr = invoice.partyAddress || invoice.customer_address || 'Address: Market Yard';
  doc.text(custAddr.slice(0, 42), col2X + 4, y + 21);

  // Items Table Header
  y += 38;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 18, y + 5.5);
  doc.text('VARIETY / DESCRIPTION', 26, y + 5.5);
  doc.text('UNIT', pageWidth - 100, y + 5.5, { align: 'center' });
  doc.text('QTY / BOXES', pageWidth - 70, y + 5.5, { align: 'right' });
  doc.text('RATE (₹)', pageWidth - 42, y + 5.5, { align: 'right' });
  doc.text('AMOUNT (₹)', pageWidth - 18, y + 5.5, { align: 'right' });

  // Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const rawItems = invoice.items || invoice.produceItems || [];
  rawItems.forEach((item: any, index: number) => {
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y, pageWidth - 28, 8, 'F');
    }

    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), 18, y + 5.5);

    const varietyName = item.variety || item.description || 'Produce';
    doc.setTextColor(30, 41, 59);
    doc.text(varietyName, 26, y + 5.5);

    const unit = item.unit || (item.boxes ? 'Box' : 'Kg');
    doc.setTextColor(100, 116, 139);
    doc.text(unit, pageWidth - 100, y + 5.5, { align: 'center' });

    const qtyText = unit === 'Box'
      ? `${item.boxes || item.quantity || 0} Box ${item.weight_kg ? `(${item.weight_kg}kg)` : ''}`
      : `${item.weight_kg || item.quantity || 0} Kg`;
    doc.text(qtyText, pageWidth - 70, y + 5.5, { align: 'right' });

    const rate = Number(item.rate || item.unitPrice || 0);
    doc.text(formatCurrency(rate), pageWidth - 42, y + 5.5, { align: 'right' });

    const amt = Number(item.amount || 0);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(amt), pageWidth - 18, y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, pageWidth - 14, y + 8);
    y += 8;
  });

  // Totals Area
  y += 6;
  const totalsX = pageWidth - 85;

  const subtotal = Number(invoice.subtotal || invoice.total_amount || 0);
  const discount = Number(invoice.discount || 0);
  const grandTotal = Number(invoice.total || invoice.total_amount || 0);
  const paid = Number(invoice.paidAmount || invoice.paid_amount || 0);
  const balanceDue = Number(invoice.balanceDue || invoice.balance_due || Math.max(0, grandTotal - paid));

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, y);
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(subtotal), pageWidth - 18, y, { align: 'right' });

  if (discount > 0) {
    y += 6;
    doc.setTextColor(239, 68, 68);
    doc.text('Discount:', totalsX, y);
    doc.text(`-${formatCurrency(discount)}`, pageWidth - 18, y, { align: 'right' });
  }

  y += 6;
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(totalsX - 4, y, pageWidth - totalsX - 10, 9, 1, 1, 'F');
  doc.setDrawColor(13, 148, 136);
  doc.roundedRect(totalsX - 4, y, pageWidth - totalsX - 10, 9, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(13, 148, 136);
  doc.text('TOTAL BILL:', totalsX, y + 6);
  doc.text(formatCurrency(grandTotal), pageWidth - 18, y + 6, { align: 'right' });

  // Paid & Balance row
  y += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('Amount Paid:', totalsX, y);
  doc.text(formatCurrency(paid), pageWidth - 18, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balanceDue > 0 ? 217 : 16, balanceDue > 0 ? 119 : 185, balanceDue > 0 ? 6 : 129);
  doc.text('BALANCE DUE:', totalsX, y);
  doc.text(formatCurrency(balanceDue), pageWidth - 18, y, { align: 'right' });

  // Notes on bottom left
  const notesY = y - 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Payment Terms & Variety Info', 14, notesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Accepted: Cash • UPI (GPay/PhonePe) • Bank Transfer (IMPS/NEFT)', 14, notesY + 5);
  doc.text('Produce sold once weighed cannot be exchanged or returned.', 14, notesY + 9);
  if (invoice.notes) {
    doc.text(`Notes: ${invoice.notes.slice(0, 50)}`, 14, notesY + 13);
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('KBN Traders Produce Billing • APMC Market Yard • Computer Generated Bill', 14, pageHeight - 10);
  doc.text('Page 1 of 1', pageWidth - 14, pageHeight - 10, { align: 'right' });

  return doc;
}

export function downloadInvoicePDF(invoice: any, companyName = 'KBN Traders'): void {
  const doc = generateInvoicePDF(invoice, companyName);
  const invNum = invoice.invoiceNumber || invoice.invoice_number || 'Bill';
  doc.save(`${invNum}_KBN_Traders.pdf`);
}

export function printInvoicePDF(invoice: any, companyName = 'KBN Traders'): void {
  const doc = generateInvoicePDF(invoice, companyName);
  doc.autoPrint();
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.focus();
  }
}

/**
 * Generate Customer Ledger Statement PDF
 */
export function generateCustomerLedgerPDF(customer: Customer, entries: CustomerLedgerRow[], companyName = 'KBN Traders'): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Teal Header
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CUSTOMER ACCOUNT STATEMENT', pageWidth - 14, 15, { align: 'right' });

  // Customer Summary Banner
  let y = 35;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name, 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Phone: ${customer.phone} | Address: ${customer.address || 'APMC Yard'}`, 14, y + 5);

  y += 14;
  // Summary Metrics Bar
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'S');

  const curBal = Number(customer.current_balance);
  const openBal = Number(customer.opening_balance);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('OPENING BALANCE', 22, y + 6);
  doc.text('TOTAL BILLED', 80, y + 6);
  doc.text('TOTAL PAID', 130, y + 6);
  doc.text('CURRENT OUTSTANDING', pageWidth - 22, y + 6, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(formatCurrency(openBal), 22, y + 13);
  doc.text(formatCurrency(Number(customer.total_sales || 0)), 80, y + 13);
  doc.setTextColor(16, 185, 129);
  doc.text(formatCurrency(Number(customer.total_paid || 0)), 130, y + 13);

  doc.setTextColor(curBal > 0 ? 217 : 16, curBal > 0 ? 119 : 185, curBal > 0 ? 6 : 129);
  doc.text(formatCurrency(curBal), pageWidth - 22, y + 13, { align: 'right' });

  // Ledger Table
  y += 26;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', 18, y + 5.5);
  doc.text('REF / INVOICE', 42, y + 5.5);
  doc.text('TRANSACTION PARTICULARS', 75, y + 5.5);
  doc.text('DEBIT (₹)', pageWidth - 65, y + 5.5, { align: 'right' });
  doc.text('CREDIT (₹)', pageWidth - 40, y + 5.5, { align: 'right' });
  doc.text('BALANCE (₹)', pageWidth - 18, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  entries.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }

    doc.setTextColor(100, 116, 139);
    doc.text(formatDate(row.date), 18, y + 5);
    doc.text(row.reference, 42, y + 5);

    doc.setTextColor(30, 41, 59);
    const desc = row.description.length > 34 ? `${row.description.slice(0, 34)}...` : row.description;
    doc.text(desc, 75, y + 5);

    const debit = Number(row.debit);
    const credit = Number(row.credit);
    doc.text(debit > 0 ? formatCurrency(debit) : '-', pageWidth - 65, y + 5, { align: 'right' });
    doc.setTextColor(16, 185, 129);
    doc.text(credit > 0 ? formatCurrency(credit) : '-', pageWidth - 40, y + 5, { align: 'right' });

    const bal = Number(row.running_balance);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(bal), pageWidth - 18, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, pageWidth - 14, y + 7);
    y += 7;
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official statement generated for ${customer.name} on ${new Date().toLocaleDateString('en-IN')}`, 14, pageHeight - 10);
  doc.text('KBN Traders', pageWidth - 14, pageHeight - 10, { align: 'right' });

  return doc;
}

export function downloadCustomerLedgerPDF(customer: Customer, entries: CustomerLedgerRow[], companyName = 'KBN Traders'): void {
  const doc = generateCustomerLedgerPDF(customer, entries, companyName);
  doc.save(`${customer.name.replace(/\s+/g, '_')}_Statement.pdf`);
}
