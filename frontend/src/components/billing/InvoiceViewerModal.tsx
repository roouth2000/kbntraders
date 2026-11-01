import { Download, Printer } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadInvoicePDF, printInvoicePDF } from '../../utils/pdfGenerator';

interface InvoiceViewerModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
}

export function InvoiceViewerModal({
  invoice,
  isOpen,
  onClose,
  onUpdateStatus,
}: InvoiceViewerModalProps) {
  if (!invoice) return null;

  const handleDownload = () => {
    downloadInvoicePDF(invoice, 'KBN Traders');
  };

  const handlePrint = () => {
    printInvoicePDF(invoice, 'KBN Traders');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${invoice.invoiceNumber}`}
      subtitle={`${invoice.type === 'sales' ? 'Customer Sales Invoice' : 'Supplier Purchase Voucher'} • Issued ${formatDate(invoice.date)}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="flex items-center gap-2">
              <select
                value={invoice.status}
                onChange={(e) => onUpdateStatus(invoice.id, e.target.value as InvoiceStatus)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              <Badge
                variant={
                  invoice.status === 'Paid'
                    ? 'success'
                    : invoice.status === 'Pending'
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
              >
                {invoice.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none">
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload} className="flex-1 sm:flex-none">
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Invoice Paper Preview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col xs:flex-row justify-between items-start border-b border-slate-100 pb-4 sm:pb-5 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">KBN TRADERS</span>
              </div>
              <p className="text-xs text-slate-500">Finova Global Commercial Operations</p>
              <p className="text-[11px] text-slate-400">GSTIN / VAT: 27AABCK1234F1Z8</p>
            </div>

            <div className="text-left xs:text-right">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-teal-200/60">
                {invoice.type === 'sales' ? 'Tax Invoice' : 'Purchase Voucher'}
              </span>
              <p className="text-sm font-mono font-bold text-slate-800 mt-1 sm:mt-2">{invoice.invoiceNumber}</p>
              <p className="text-[11px] text-slate-400">Due: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Party Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Billed To:
              </p>
              <p className="font-bold text-slate-800 text-sm">{invoice.partyName}</p>
              <p className="text-slate-500">{invoice.partyEmail}</p>
              <p className="text-slate-500">{invoice.partyAddress}</p>
              {invoice.partyTaxId && (
                <p className="text-slate-400 text-[11px] mt-0.5">Tax ID: {invoice.partyTaxId}</p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Payment Details:
              </p>
              <p className="font-semibold text-slate-700">{invoice.paymentMethod || 'Bank Wire'}</p>
              <p className="text-slate-500">Issued: {formatDate(invoice.date)}</p>
              <p className="text-teal-600 font-medium">Terms: 15 Days</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item: any, idx: number) => {
                  const desc = item.variety || item.description || 'Produce';
                  const qty = item.unit === 'Box'
                    ? `${item.boxes || item.quantity || 0} Box`
                    : `${item.weight_kg || item.quantity || 0} Kg`;
                  const price = item.rate || item.unitPrice || 0;
                  return (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{desc}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{qty}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {formatCurrency(price)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-teal-800 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-base text-teal-700">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500 border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
              {invoice.notes}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
