import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Customer, Invoice, PaymentMode } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DollarSign, User, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (paymentData: any) => Promise<any>;
  customers: Customer[];
  invoices: Invoice[];
  initialCustomerId?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onRecordPayment,
  customers,
  invoices,
  initialCustomerId,
}: PaymentModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected customer details
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentDue = currentCustomer ? Number(currentCustomer.current_balance) : 0;

  // Pending invoices for this customer
  const customerInvoices = invoices.filter(
    (inv) =>
      (inv.customerId === selectedCustomerId || inv.partyName === currentCustomer?.name) &&
      inv.status !== 'Paid'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

      await onRecordPayment({
        customerId: selectedCustomerId,
        customerName: currentCustomer?.name || 'Customer',
        invoiceId: selectedInvoiceId || undefined,
        invoiceNumber: selectedInvoice?.invoiceNumber || undefined,
        amount: amt,
        paymentMode,
        transactionRef,
        paymentDate,
        notes,
      });

      onClose();
      setAmount('');
      setTransactionRef('');
      setNotes('');
    } catch (err: any) {
      alert('Error recording payment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Collection / Payment"
      subtitle="Manage Cash, UPI, and Bank Transfer receipts with partial & advance support"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Customer Select */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" />
            Select Customer Account *
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setSelectedInvoiceId('');
            }}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
            required
          >
            <option value="">-- Choose Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) - Current Due: {formatCurrency(c.current_balance)}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Balance Preview Card */}
        {currentCustomer && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {currentDue > 0 ? 'Outstanding Due:' : currentDue < 0 ? 'Advance Deposited:' : 'Account Status:'}
              </span>
              <p
                className={`font-mono font-bold text-sm ${
                  currentDue > 0 ? 'text-amber-700' : currentDue < 0 ? 'text-emerald-700' : 'text-slate-700'
                }`}
              >
                {formatCurrency(currentDue)}
              </p>
            </div>

            {currentDue > 0 && (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmount(String(currentDue))}
                  className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold border border-teal-200 cursor-pointer active:scale-95"
                >
                  Full Due
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.round(currentDue / 2)))}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer active:scale-95"
                >
                  Half
                </button>
              </div>
            )}
          </div>
        )}

        {/* Optional Link to Specific Pending Invoice */}
        {customerInvoices.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Link to Unpaid Bill (Optional)
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => {
                setSelectedInvoiceId(e.target.value);
                const inv = customerInvoices.find((i) => i.id === e.target.value);
                if (inv && inv.balanceDue) {
                  setAmount(String(inv.balanceDue));
                }
              }}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="">General Payment / Account Credit</option>
              {customerInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} ({formatDate(inv.date)}) - Due: {formatCurrency(inv.balanceDue || inv.total)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Payment Collection Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 text-sm font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>
        </div>

        {/* Payment Mode Selector: Cash, UPI, Bank Transfer */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            Payment Mode (Cash, UPI, Bank Transfer) *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['UPI', 'Cash', 'Bank Transfer'] as PaymentMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMode(mode)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border min-h-[42px] cursor-pointer active:scale-95 flex items-center justify-center ${
                  paymentMode === mode
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Date and Transaction Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              {paymentMode === 'UPI' ? 'UPI Ref / UTR #' : paymentMode === 'Bank Transfer' ? 'NEFT / IMPS Ref' : 'Cash Slip #'}
            </label>
            <input
              type="text"
              placeholder={paymentMode === 'UPI' ? 'e.g. UPI/4291039481' : 'Ref #'}
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Receipt Remarks / Notes</label>
          <input
            type="text"
            placeholder="e.g. Received via PhonePe by cashier"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse xs:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[42px] justify-center"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-[#0d9488] min-h-[42px] justify-center font-bold"
            disabled={isSubmitting}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Confirm & Update Ledger</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
