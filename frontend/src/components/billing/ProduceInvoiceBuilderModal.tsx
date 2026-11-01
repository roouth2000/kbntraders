import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Share2, FileDown, CheckCircle2, User, Scale, Box, DollarSign } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Customer, ProduceVariety, ProduceInvoiceItem, PaymentMode } from '../../types';
import { formatCurrency, generateInvoiceNumber, buildWhatsAppBillMessage } from '../../utils/formatters';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

interface ProduceInvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoiceData: any) => Promise<any>;
  customers: Customer[];
  varieties: ProduceVariety[];
  defaultCustomerId?: string;
  onAddCustomer?: (customer: any) => Promise<any>;
  onAddVariety?: (variety: any) => Promise<any>;
}

export function ProduceInvoiceBuilderModal({
  isOpen,
  onClose,
  onSaveInvoice,
  customers,
  varieties,
  defaultCustomerId,
  onAddCustomer,
  onAddVariety,
}: ProduceInvoiceBuilderModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateInvoiceNumber('sales'));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomerDue, setSelectedCustomerDue] = useState(0);

  // Items State (Multi-variety with Kg & Box support)
  const [items, setItems] = useState<ProduceInvoiceItem[]>([
    {
      id: 'item-1',
      variety: 'A1',
      unit: 'Box',
      boxes: 10,
      weight_kg: 200,
      rate: 1100,
      amount: 11000,
    },
  ]);

  // Billing & Payment
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add Custom Variety Modal inside builder
  const [isCustomVarietyModalOpen, setIsCustomVarietyModalOpen] = useState(false);
  const [customFruit, setCustomFruit] = useState<'Apple' | 'Malta' | 'Other'>('Apple');
  const [customOrigin, setCustomOrigin] = useState('Indian');
  const [customSizeCount, setCustomSizeCount] = useState('135 Count');
  const [customVarietyCode, setCustomVarietyCode] = useState('');
  const [customVarietyName, setCustomVarietyName] = useState('');
  const [customDefaultUnit, setCustomDefaultUnit] = useState<'Kg' | 'Box'>('Box');
  const [customRateKg, setCustomRateKg] = useState('95');
  const [customRateBox, setCustomRateBox] = useState('1850');

  // Sync customer selection
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || '');
      setSelectedCustomerDue(Number(found.current_balance));
    } else {
      setSelectedCustomerDue(0);
    }
  };

  // Pre-select customer if defaultCustomerId provided
  useEffect(() => {
    if (isOpen && defaultCustomerId) {
      handleCustomerSelect(defaultCustomerId);
    }
  }, [isOpen, defaultCustomerId]);

  // Variety changes
  const handleVarietyChange = (index: number, varietyCode: string) => {
    if (varietyCode === '__ADD_NEW__') {
      setIsCustomVarietyModalOpen(true);
      return;
    }
    const varDef = varieties.find((v) => v.code === varietyCode);
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], variety: varietyCode };
      if (varDef) {
        const rate = current.unit === 'Box' ? Number(varDef.default_rate_box) : Number(varDef.default_rate_kg);
        current.rate = rate;
        current.amount = current.unit === 'Box' ? (current.boxes || 1) * rate : (current.weight_kg || 1) * rate;
      }
      updated[index] = current;
      return updated;
    });
  };

  // Unit changes (Kg vs Box with separate rates)
  const handleUnitChange = (index: number, unit: 'Kg' | 'Box') => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], unit };
      const varDef = varieties.find((v) => v.code === current.variety);
      if (varDef) {
        current.rate = unit === 'Box' ? Number(varDef.default_rate_box) : Number(varDef.default_rate_kg);
      }
      if (unit === 'Box') {
        const b = current.boxes || 1;
        current.amount = Math.round(b * current.rate * 100) / 100;
      } else {
        const w = current.weight_kg || 1;
        current.amount = Math.round(w * current.rate * 100) / 100;
      }
      updated[index] = current;
      return updated;
    });
  };

  const handleItemFieldChange = (index: number, field: keyof ProduceInvoiceItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      const rate = Number(field === 'rate' ? value : current.rate) || 0;
      const unit = current.unit;

      if (unit === 'Box') {
        const boxes = Number(field === 'boxes' ? value : current.boxes) || 0;
        current.amount = Math.round(boxes * rate * 100) / 100;
      } else {
        const weight = Number(field === 'weight_kg' ? value : current.weight_kg) || 0;
        current.amount = Math.round(weight * rate * 100) / 100;
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleAddItem = () => {
    const defaultVar = varieties[0]?.code || 'A1';
    const varDef = varieties[0];
    const defaultRate = varDef?.default_rate_box || 1000;
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length}`,
        variety: defaultVar,
        unit: 'Box',
        boxes: 1,
        weight_kg: 20,
        rate: defaultRate,
        amount: defaultRate,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const grandTotal = Math.max(0, subtotal - Number(discount || 0));
  const balanceDue = Math.max(0, grandTotal - Number(paidAmount || 0));

  const handleSaveAndAction = async (action: 'save' | 'print' | 'whatsapp' | 'pdf') => {
    if (!customerName.trim()) {
      alert('Please select or enter customer name.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one variety.');
      return;
    }

    setIsSubmitting(true);
    try {
      const invoicePayload = {
        invoiceNumber,
        customerId: selectedCustomerId || `cust-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        date,
        dueDate,
        items,
        subtotal,
        discount: Number(discount) || 0,
        total: grandTotal,
        paidAmount: Number(paidAmount) || 0,
        balanceDue,
        paymentMode,
        transactionRef,
        notes,
      };

      const saved = await onSaveInvoice(invoicePayload);

      if (action === 'pdf' || action === 'print') {
        downloadInvoicePDF(saved || invoicePayload, 'KBN Traders');
      }

      if (action === 'whatsapp') {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        const text = buildWhatsAppBillMessage(saved || invoicePayload, { name: customerName, phone: customerPhone }, selectedCustomerDue);
        const url = `https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : ''}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }

      onClose();
    } catch (err: any) {
      alert('Error saving invoice: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomVarietySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVarietyCode.trim() || !customVarietyName.trim()) return;
    if (onAddVariety) {
      const added = await onAddVariety({
        fruit: customFruit,
        origin: customOrigin.trim(),
        size_count: customSizeCount.trim(),
        code: customVarietyCode.trim().toUpperCase(),
        name: customVarietyName.trim(),
        default_unit: customDefaultUnit,
        default_rate_kg: Number(customRateKg) || 0,
        default_rate_box: Number(customRateBox) || 0,
      });
      if (added) {
        setIsCustomVarietyModalOpen(false);
        setCustomVarietyCode('');
        setCustomVarietyName('');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Variety Produce Billing"
      subtitle="Issue Mandi bill with A1, A2, A3, SPL, Loosu & custom produce varieties"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-slate-800">
        {/* Top Meta Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Bill / Invoice #</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full text-xs font-bold font-mono text-slate-800 bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Billing Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Due Date (Credit)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Customer Selection Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Customer Details & Account
            </h3>
            {selectedCustomerDue !== 0 && (
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                selectedCustomerDue > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedCustomerDue > 0 ? `Prev Due: ₹${selectedCustomerDue.toLocaleString('en-IN')}` : `Advance Credit: ₹${Math.abs(selectedCustomerDue).toLocaleString('en-IN')}`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Select Existing Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              >
                <option value="">-- Choose Customer or Enter Below --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - Due: ₹{Number(c.current_balance).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Traders"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Phone Number (WhatsApp) *</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Produce Variety Line Items */}
        <div>
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              Produce Variety Line Items ({items.length})
            </h3>
            <div className="flex items-center gap-2 self-start xs:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomVarietyModalOpen(true)}
                className="text-xs text-teal-700 hover:bg-teal-50 py-1.5 px-2.5"
              >
                + New Variety Grade
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                className="text-xs bg-white border border-slate-200 py-1.5 px-2.5"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600" />
                Add Variety Row
              </Button>
            </div>
          </div>

          {/* Mobile Card-Based Items View (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Line Item #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Variety Selector */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                    Variety Grade
                  </label>
                  <select
                    value={item.variety}
                    onChange={(e) => handleVarietyChange(idx, e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <optgroup label="🍎 Apple Varieties">
                      {varieties
                        .filter((v) => (v.fruit || 'Apple').toLowerCase().includes('apple'))
                        .map((v) => (
                          <option key={v.id} value={v.code}>
                            {v.code} - {v.name} {v.size_count ? `(${v.size_count})` : ''} - ₹{v.default_unit === 'Box' ? `${v.default_rate_box}/Box` : `${v.default_rate_kg}/Kg`}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🍊 Malta Varieties">
                      {varieties
                        .filter((v) => (v.fruit || '').toLowerCase().includes('malta'))
                        .map((v) => (
                          <option key={v.id} value={v.code}>
                            {v.code} - {v.name} {v.size_count ? `(${v.size_count})` : ''} - ₹{v.default_unit === 'Box' ? `${v.default_rate_box}/Box` : `${v.default_rate_kg}/Kg`}
                          </option>
                        ))}
                    </optgroup>
                    {varieties.some((v) => !(v.fruit || 'Apple').toLowerCase().includes('apple') && !(v.fruit || '').toLowerCase().includes('malta')) && (
                      <optgroup label="📦 Other Varieties">
                        {varieties
                          .filter((v) => !(v.fruit || 'Apple').toLowerCase().includes('apple') && !(v.fruit || '').toLowerCase().includes('malta'))
                          .map((v) => (
                            <option key={v.id} value={v.code}>
                              {v.code} - {v.name} - ₹{v.default_unit === 'Box' ? `${v.default_rate_box}/Box` : `${v.default_rate_kg}/Kg`}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    <option value="__ADD_NEW__">+ Add Custom Variety...</option>
                  </select>
                </div>

                {/* Unit Toggle and Quantities */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Unit Sale
                    </label>
                    <div className="inline-flex w-full rounded-lg border border-slate-200 p-0.5 bg-white">
                      <button
                        type="button"
                        onClick={() => handleUnitChange(idx, 'Box')}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                          item.unit === 'Box'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        <Box className="w-3 h-3" />
                        Box
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitChange(idx, 'Kg')}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                          item.unit === 'Kg'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        Kg
                      </button>
                    </div>
                  </div>

                  {item.unit === 'Box' ? (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                        Boxes Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.boxes || ''}
                        onChange={(e) => handleItemFieldChange(idx, 'boxes', e.target.value)}
                        className="w-full text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 bg-white text-slate-800 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                        Weight (Kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.weight_kg || ''}
                        onChange={(e) => handleItemFieldChange(idx, 'weight_kg', e.target.value)}
                        className="w-full text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 bg-white text-slate-800 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>

                {/* Rate & Line Total */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Rate / {item.unit}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate || ''}
                        onChange={(e) => handleItemFieldChange(idx, 'rate', e.target.value)}
                        className="w-full pl-6 text-xs font-mono font-bold rounded-lg px-2 py-1.5 bg-white text-slate-800 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Line Total
                    </label>
                    <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Variety</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Unit Sale</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Boxes</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Weight (Kg)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Line Total (₹)</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Variety Selector */}
                    <td className="p-2.5 min-w-[130px]">
                      <select
                        value={item.variety}
                        onChange={(e) => handleVarietyChange(idx, e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <optgroup label="🍎 Apple Varieties">
                          {varieties
                            .filter((v) => (v.fruit || 'Apple').toLowerCase().includes('apple'))
                            .map((v) => (
                              <option key={v.id} value={v.code}>
                                {v.code} - {v.name} {v.size_count ? `(${v.size_count})` : ''} - ₹{v.default_unit === 'Box' ? `${v.default_rate_box}/Box` : `${v.default_rate_kg}/Kg`}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="🍊 Malta Varieties">
                          {varieties
                            .filter((v) => (v.fruit || '').toLowerCase().includes('malta'))
                            .map((v) => (
                              <option key={v.id} value={v.code}>
                                {v.code} - {v.name} {v.size_count ? `(${v.size_count})` : ''} - ₹{v.default_unit === 'Box' ? `${v.default_rate_box}/Box` : `${v.default_rate_kg}/Kg`}
                              </option>
                            ))}
                        </optgroup>
                        {varieties.some((v) => !(v.fruit || 'Apple').toLowerCase().includes('apple') && !(v.fruit || '').toLowerCase().includes('malta')) && (
                          <optgroup label="📦 Other Varieties">
                            {varieties
                              .filter((v) => !(v.fruit || 'Apple').toLowerCase().includes('apple') && !(v.fruit || '').toLowerCase().includes('malta'))
                              .map((v) => (
                                <option key={v.id} value={v.code}>
                                  {v.code} - {v.name} - ₹{v.default_unit === 'Box' ? `${v.default_rate_box}/Box` : `${v.default_rate_kg}/Kg`}
                                </option>
                              ))}
                          </optgroup>
                        )}
                        <option value="__ADD_NEW__">+ Add Custom Variety...</option>
                      </select>
                    </td>

                    {/* Unit Selector (Kg vs Box toggle) */}
                    <td className="p-2.5 text-center min-w-[120px]">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleUnitChange(idx, 'Box')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            item.unit === 'Box'
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Box className="w-3 h-3" />
                          Box
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnitChange(idx, 'Kg')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            item.unit === 'Kg'
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Scale className="w-3 h-3" />
                          Kg
                        </button>
                      </div>
                    </td>

                    {/* Boxes Count */}
                    <td className="p-2.5 text-right w-24">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.boxes || ''}
                        disabled={item.unit === 'Kg'}
                        placeholder={item.unit === 'Kg' ? '-' : '0'}
                        onChange={(e) => handleItemFieldChange(idx, 'boxes', e.target.value)}
                        className={`w-full text-right text-xs font-mono font-medium rounded-lg px-2 py-1.5 border ${
                          item.unit === 'Kg'
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500'
                        }`}
                      />
                    </td>

                    {/* Weight (Kg) */}
                    <td className="p-2.5 text-right w-28">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.weight_kg || ''}
                        placeholder="0.0"
                        onChange={(e) => handleItemFieldChange(idx, 'weight_kg', e.target.value)}
                        className="w-full text-right text-xs font-mono font-medium rounded-lg px-2 py-1.5 bg-white text-slate-800 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </td>

                    {/* Rate (per Unit) */}
                    <td className="p-2.5 text-right w-28">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-slate-400 text-xs font-mono">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) => handleItemFieldChange(idx, 'rate', e.target.value)}
                          className="w-full text-right pl-5 text-xs font-mono font-bold rounded-lg px-2 py-1.5 bg-white text-slate-800 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">/{item.unit}</span>
                    </td>

                    {/* Line Amount */}
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-xs w-28">
                      {formatCurrency(item.amount)}
                    </td>

                    {/* Delete Row */}
                    <td className="p-2.5 text-center w-10">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Calculations & Payment Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-200">
          {/* Left: Payment & Settlement */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-600" />
              Settlement & Payment Mode
            </h4>

            {/* Payment Mode Buttons */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Payment Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                      paymentMode === mode
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                  className="w-full text-xs font-bold font-mono text-emerald-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <div className="flex gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setPaidAmount(grandTotal)}
                    className="text-[10px] text-teal-600 hover:underline font-semibold"
                  >
                    Full (₹{grandTotal.toLocaleString('en-IN')})
                  </button>
                  <span className="text-[10px] text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setPaidAmount(0)}
                    className="text-[10px] text-slate-500 hover:underline font-semibold"
                  >
                    Credit (₹0)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Ref # / UPI UTR</label>
                <input
                  type="text"
                  placeholder="UPI Ref or Cash Slip #"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Bill Notes / Vehicle / Mandi Remark</label>
              <input
                type="text"
                placeholder="e.g. Vehicle KA-05-AB-1234, Loading charges included"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Right: Summary Card */}
          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal ({items.length} varieties):</span>
                <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Special Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={discount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-24 text-right text-xs font-mono bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-teal-200/80 flex justify-between items-center text-base font-bold text-slate-900">
                <span>Total Bill Amount:</span>
                <span className="font-mono text-teal-700 text-lg">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Amount Received Now:</span>
                <span className="font-mono">- {formatCurrency(paidAmount)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-teal-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Bill Balance Due:</span>
                <span className={`text-base font-bold font-mono ${balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>

              {selectedCustomerDue > 0 && (
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>Previous Account Due:</span>
                  <span className="font-mono">{formatCurrency(selectedCustomerDue)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-300 flex justify-between text-xs font-bold text-slate-900">
                <span>Total Net Customer Due:</span>
                <span className="font-mono text-amber-800">{formatCurrency(selectedCustomerDue + balanceDue)}</span>
              </div>
            </div>

            {/* Quick Action Footer inside Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2">
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={() => handleSaveAndAction('save')}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-xs py-2.5 font-bold justify-center min-h-[42px] active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save Bill
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => handleSaveAndAction('print')}
                className="bg-white border border-slate-200 text-xs py-2.5 font-semibold justify-center min-h-[42px] active:scale-[0.98]"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print Bill
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => handleSaveAndAction('pdf')}
                className="bg-white border border-slate-200 text-xs py-2.5 font-semibold justify-center min-h-[42px] active:scale-[0.98]"
              >
                <FileDown className="w-3.5 h-3.5 text-teal-600" />
                PDF
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => handleSaveAndAction('whatsapp')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 font-bold justify-center min-h-[42px] active:scale-[0.98]"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Sub-Modal: Add Custom Variety */}
      <Modal
        isOpen={isCustomVarietyModalOpen}
        onClose={() => setIsCustomVarietyModalOpen(false)}
        title="Add Custom Produce Variety"
        subtitle="Configure new produce grade with dedicated Kg and Box rates"
        maxWidth="md"
      >
        <form onSubmit={handleAddCustomVarietySubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setCustomFruit('Apple');
                setCustomOrigin('Indian');
                setCustomSizeCount('135 Count');
                setCustomDefaultUnit('Box');
                setCustomRateKg('95');
                setCustomRateBox('1850');
              }}
              className={`py-1.5 px-2 rounded-lg border text-xs font-bold ${
                customFruit === 'Apple' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              🍎 Apple
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomFruit('Malta');
                setCustomOrigin('Indian');
                setCustomSizeCount('88 Count');
                setCustomDefaultUnit('Box');
                setCustomRateKg('65');
                setCustomRateBox('1300');
              }}
              className={`py-1.5 px-2 rounded-lg border text-xs font-bold ${
                customFruit === 'Malta' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              🍊 Malta
            </button>
            <button
              type="button"
              onClick={() => setCustomFruit('Other')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-bold ${
                customFruit === 'Other' ? 'bg-purple-50 border-purple-500 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              📦 Other
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Country / Origin"
              placeholder="Indian, Turkey, Poland..."
              value={customOrigin}
              onChange={(e) => setCustomOrigin(e.target.value)}
              required
            />
            <Input
              label="Caliber / Count"
              placeholder="135 Count, 88 Count..."
              value={customSizeCount}
              onChange={(e) => setCustomSizeCount(e.target.value)}
              required
            />
          </div>

          <Input
            label="Variety Code (e.g. APL-IND-135, MLT-80)"
            placeholder="APL-IND-135"
            value={customVarietyCode}
            onChange={(e) => setCustomVarietyCode(e.target.value.toUpperCase())}
            required
          />

          <Input
            label="Variety Full Name"
            placeholder="e.g. Indian Apple 135 Count"
            value={customVarietyName}
            onChange={(e) => setCustomVarietyName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Default Sale Unit</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="customUnit"
                  checked={customDefaultUnit === 'Kg'}
                  onChange={() => setCustomDefaultUnit('Kg')}
                />
                Kilograms (Kg)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="customUnit"
                  checked={customDefaultUnit === 'Box'}
                  onChange={() => setCustomDefaultUnit('Box')}
                />
                Boxes (Box)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Standard Rate per Kg (₹)"
              type="number"
              step="0.01"
              value={customRateKg}
              onChange={(e) => setCustomRateKg(e.target.value)}
              required
            />
            <Input
              label="Standard Rate per Box (₹)"
              type="number"
              step="0.01"
              value={customRateBox}
              onChange={(e) => setCustomRateBox(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsCustomVarietyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-[#0d9488]">
              Add Variety Grade
            </Button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
}
