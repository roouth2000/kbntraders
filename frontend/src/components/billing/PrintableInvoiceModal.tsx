import { Printer, Share2, FileDown, CheckCircle2, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Invoice } from '../../types';
import { formatCurrency, formatDate, buildWhatsAppBillMessage } from '../../utils/formatters';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  previousDue?: number;
}

export function PrintableInvoiceModal({
  isOpen,
  onClose,
  invoice,
  previousDue = 0,
}: PrintableInvoiceModalProps) {
  if (!invoice) return null;

  const rawItems = (invoice.items || invoice.produceItems || []) as any[];
  const grandTotal = Number(invoice.total || 0);
  const paid = Number(invoice.paidAmount || 0);
  const balanceDue = Number(invoice.balanceDue !== undefined ? invoice.balanceDue : Math.max(0, grandTotal - paid));
  const totalOutstanding = previousDue + balanceDue;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const phone = (invoice.partyPhone || '').replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const text = buildWhatsAppBillMessage(invoice, { name: invoice.partyName, phone: invoice.partyPhone }, previousDue);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDF = () => {
    downloadInvoicePDF(invoice, 'KBN Traders');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bill Invoice - ${invoice.invoiceNumber}`}
      subtitle="Printable bill format and instant WhatsApp sharing"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Printable Bill Paper Card */}
        <div id="printable-bill-area" className="bg-white p-3.5 sm:p-6 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-teal-600 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-6 bg-teal-600 rounded-full rotate-[-15deg]"></div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">KBN TRADERS</h2>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Wholesale Multi-Variety Produce & Commission Mandi
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                APMC Market Yard, Bengaluru, KA • Phone: +91 98765 43210 • GSTIN: 29AABCK1234F1Z5
              </p>
            </div>

            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span className="text-[10px] sm:text-xs font-bold font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200 uppercase">
                {invoice.status}
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-1.5">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500 font-mono">Date: {formatDate(invoice.date)}</p>
            </div>
          </div>

          {/* Customer & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3 border-b border-slate-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To (Customer):</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.partyName}</p>
              {invoice.partyPhone && (
                <p className="text-slate-600 font-mono mt-0.5">Phone: {invoice.partyPhone}</p>
              )}
              {invoice.partyAddress && (
                <p className="text-slate-500 mt-0.5">{invoice.partyAddress}</p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Particulars:</span>
              <p className="font-semibold text-slate-800 mt-0.5">Mode: {invoice.paymentMode || 'Cash'}</p>
              <p className="text-slate-500 mt-0.5">Due Date: {formatDate(invoice.dueDate)}</p>
              {invoice.transactionRef && (
                <p className="text-slate-500 font-mono mt-0.5">Ref: {invoice.transactionRef}</p>
              )}
            </div>
          </div>

          {/* Produce Items Breakdown Table */}
          <div className="my-4 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-3">Variety Grade</th>
                  <th className="py-2 px-2 text-center">Unit</th>
                  <th className="py-2 px-3 text-right">Boxes</th>
                  <th className="py-2 px-3 text-right">Weight (Kg)</th>
                  <th className="py-2 px-3 text-right">Rate (₹)</th>
                  <th className="py-2 px-3 text-right font-bold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawItems.map((item, idx) => {
                  const isBox = item.unit === 'Box';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {item.variety || item.description}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600 font-medium">
                        {item.unit || (item.boxes ? 'Box' : 'Kg')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {item.boxes ? `${item.boxes} Box` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {item.weight_kg ? `${item.weight_kg} Kg` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(item.rate || item.unitPrice || 0)}/{isBox ? 'Box' : 'Kg'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bill Totals Section */}
          <div className="pt-2 border-t-2 border-slate-200 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal)}</span>
              </div>

              {Number(invoice.discount || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Special Discount:</span>
                  <span className="font-mono font-semibold">-{formatCurrency(invoice.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                <span>Bill Grand Total:</span>
                <span className="font-mono text-teal-800 text-base">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatCurrency(paid)} ({invoice.paymentMode || 'Cash'})</span>
              </div>

              <div className="flex justify-between text-amber-800 font-bold pt-1 border-t border-slate-100">
                <span>Bill Balance Due:</span>
                <span className="font-mono">{formatCurrency(balanceDue)}</span>
              </div>

              {previousDue > 0 && (
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Previous Account Due:</span>
                  <span className="font-mono">{formatCurrency(previousDue)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t-2 border-slate-800">
                <span>Net Total Payable:</span>
                <span className="font-mono text-base text-amber-900">{formatCurrency(totalOutstanding)}</span>
              </div>
            </div>
          </div>

          {/* Bill Remarks & Footer */}
          {invoice.notes && (
            <div className="mt-4 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
              <span className="font-bold">Remarks: </span>
              {invoice.notes}
            </div>
          )}

          <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Thank you for trading with KBN Traders APMC Mandi • Computer Generated Bill • Valid without physical signature
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <Button variant="ghost" onClick={onClose} className="text-xs min-h-[40px] justify-center">
            Close
          </Button>

          <div className="grid grid-cols-3 sm:flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handlePrint}
              className="bg-white border border-slate-200 text-xs py-2 px-2.5 sm:px-3 font-semibold min-h-[40px] justify-center active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="truncate">Print</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownloadPDF}
              className="bg-white border border-slate-200 text-xs py-2 px-2.5 sm:px-3 font-semibold min-h-[40px] justify-center active:scale-[0.98]"
            >
              <FileDown className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate">PDF</span>
            </Button>

            <Button
              variant="primary"
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 sm:px-4 font-bold min-h-[40px] justify-center active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span className="truncate">WhatsApp</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
