import { InvoiceItem, ProduceInvoiceItem } from '../types';

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absNum);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateInvoiceNumber(type: 'sales' | 'purchase' = 'sales'): string {
  const prefix = type === 'sales' ? 'INV' : 'BILL';
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}

export function calculateInvoiceTotals(
  items: (InvoiceItem | ProduceInvoiceItem)[],
  taxRatePercent: number = 0,
  discountAmount: number = 0
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    if ('amount' in item && typeof item.amount === 'number' && item.amount > 0) {
      return sum + item.amount;
    }
    if ('quantity' in item && 'unitPrice' in item) {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }
    return sum;
  }, 0);

  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxable * taxRatePercent) / 100;
  const total = taxable + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Generate formatted WhatsApp message text for bill sharing
 */
export function buildWhatsAppBillMessage(invoice: any, customer?: any, previousDue: number = 0): string {
  const dateFormatted = formatDate(invoice.date);
  let itemsLines = '';

  const items = invoice.items || invoice.produceItems || [];
  if (Array.isArray(items) && items.length > 0) {
    itemsLines = items
      .map((it: any) => {
        const varietyName = it.variety || it.description || 'Produce';
        const isBox = it.unit === 'Box';
        const qtyStr = isBox
          ? `${it.boxes || 0} Boxes ${it.weight_kg ? `(${it.weight_kg} Kg)` : ''}`
          : `${it.weight_kg || it.quantity || 0} Kg`;
        const rateStr = isBox ? `₹${it.rate || it.unitPrice}/Box` : `₹${it.rate || it.unitPrice}/Kg`;
        return `• *${varietyName}*: ${qtyStr} @ ${rateStr} = *₹${Number(it.amount).toLocaleString('en-IN')}*`;
      })
      .join('\n');
  }

  const grandTotal = Number(invoice.total || invoice.total_amount || 0);
  const paid = Number(invoice.paidAmount || invoice.paid_amount || 0);
  const balDue = Number(invoice.balanceDue || invoice.balance_due || Math.max(0, grandTotal - paid));
  const currentTotalDue = previousDue + balDue;

  return (
    `*KBN TRADERS - BILL INVOICE*\n` +
    `Invoice: *#${invoice.invoiceNumber || invoice.invoice_number}*\n` +
    `Date: ${dateFormatted}\n` +
    `Customer: *${customer?.name || invoice.partyName || invoice.customer_name}* (${customer?.phone || invoice.partyPhone || invoice.customer_phone || ''})\n` +
    `--------------------------------\n` +
    `*Variety Breakdown:*\n` +
    `${itemsLines}\n` +
    `--------------------------------\n` +
    `Subtotal: ₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}\n` +
    (Number(invoice.discount || 0) > 0 ? `Discount: -₹${Number(invoice.discount).toLocaleString('en-IN')}\n` : '') +
    `*Total Bill: ₹${grandTotal.toLocaleString('en-IN')}*\n` +
    `Paid: ₹${paid.toLocaleString('en-IN')} (${invoice.paymentMode || invoice.paymentMethod || 'Cash'})\n` +
    `*Bill Balance: ₹${balDue.toLocaleString('en-IN')}*\n` +
    (previousDue > 0 ? `Previous Due: ₹${previousDue.toLocaleString('en-IN')}\n` : '') +
    `*Total Outstanding: ₹${currentTotalDue.toLocaleString('en-IN')}*\n` +
    `--------------------------------\n` +
    `Thank you for your business! - KBN Traders`
  );
}

/**
 * Clean CSV export utility
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
