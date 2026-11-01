import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Plus,
  Share2,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  Box,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Edit,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Customer, Invoice, PaymentRecord, ProduceVariety, CustomerLedgerRow, InvoiceStatus } from '../../types';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { downloadCustomerLedgerPDF, downloadInvoicePDF } from '../../utils/pdfGenerator';
import { InvoiceViewerModal } from '../billing/InvoiceViewerModal';
import { PrintableInvoiceModal } from '../billing/PrintableInvoiceModal';

interface CustomerDetailViewProps {
  customer: Customer;
  invoices: Invoice[];
  payments: PaymentRecord[];
  varieties: ProduceVariety[];
  onBack: () => void;
  onOpenNewInvoice: (customerId?: string) => void;
  onOpenRecordPayment: (customerId?: string) => void;
  onEditCustomer: (customer: Customer) => void;
  getCustomerLedgerStatement: (customerId: string) => {
    customer: Customer | undefined;
    rows: CustomerLedgerRow[];
    totalDebit: number;
    totalCredit: number;
    currentBalance: number;
  };
}

export function CustomerDetailView({
  customer,
  invoices,
  payments,
  varieties,
  onBack,
  onOpenNewInvoice,
  onOpenRecordPayment,
  onEditCustomer,
  getCustomerLedgerStatement,
}: CustomerDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'dues' | 'sales' | 'payments'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | '30days'>('all');

  // Modals
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  // Invoices for this customer
  const customerInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.customerId === customer.id ||
        (inv.partyName && inv.partyName.toLowerCase() === customer.name.toLowerCase())
    );
  }, [invoices, customer]);

  // Payments for this customer
  const customerPayments = useMemo(() => {
    return payments.filter(
      (p) =>
        p.customer_id === customer.id ||
        (p.customer_name && p.customer_name.toLowerCase() === customer.name.toLowerCase())
    );
  }, [payments, customer]);

  // Filtered invoices by search
  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch.trim()) return customerInvoices;
    const q = invoiceSearch.toLowerCase();
    return customerInvoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.notes && inv.notes.toLowerCase().includes(q)) ||
        (inv.status && inv.status.toLowerCase().includes(q))
    );
  }, [customerInvoices, invoiceSearch]);

  // Running Ledger Statement
  const statementData = useMemo(() => {
    return getCustomerLedgerStatement(customer.id);
  }, [customer.id, getCustomerLedgerStatement]);

  // Filter statement rows by date
  const filteredStatementRows = useMemo(() => {
    if (!statementData) return [];
    if (dateFilter === 'all') return statementData.rows;

    const now = new Date();
    return statementData.rows.filter((r) => {
      const d = new Date(r.date);
      if (dateFilter === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (dateFilter === '30days') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [statementData, dateFilter]);

  // Statement Running Balance recalculated for filtered view
  const finalStatementRows = useMemo(() => {
    let running = 0;
    return filteredStatementRows.map((row) => {
      const debit = Number(row.debit) || 0;
      const credit = Number(row.credit) || 0;
      running = running + debit - credit;
      return {
        ...row,
        running_balance: running,
      };
    });
  }, [filteredStatementRows]);

  // Variety-wise breakdown for this customer
  const customerVarietyStats = useMemo(() => {
    const stats: Record<string, { code: string; name: string; totalKg: number; totalBoxes: number; revenue: number }> = {};
    varieties.forEach((v) => {
      stats[v.code] = { code: v.code, name: v.name, totalKg: 0, totalBoxes: 0, revenue: 0 };
    });

    customerInvoices.forEach((inv) => {
      const rawItems = (inv.items || inv.produceItems || []) as any[];
      rawItems.forEach((it) => {
        const code = it.variety || 'A1';
        if (!stats[code]) {
          stats[code] = { code, name: code, totalKg: 0, totalBoxes: 0, revenue: 0 };
        }
        if (it.unit === 'Box') {
          stats[code].totalBoxes += Number(it.boxes) || 0;
          if (it.weight_kg) stats[code].totalKg += Number(it.weight_kg) || 0;
        } else {
          stats[code].totalKg += Number(it.weight_kg) || Number(it.quantity) || 0;
        }
        stats[code].revenue += Number(it.amount) || 0;
      });
    });

    return Object.values(stats).filter((s) => s.revenue > 0 || s.totalKg > 0 || s.totalBoxes > 0);
  }, [customerInvoices, varieties]);

  // Financial aggregates
  const currentBal = Number(customer.current_balance || 0);
  const isDue = currentBal > 0;
  const isAdvance = currentBal < 0;

  const totalBilled = customerInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const totalPaidInvoices = customerInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
  const totalCollections = customerPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingInvoicesCount = customerInvoices.filter((i) => i.status === 'Pending' || i.status === 'Partial').length;
  const paidInvoicesCount = customerInvoices.filter((i) => i.status === 'Paid').length;

  const collectionsByMode = {
    cash: customerPayments.filter((p) => p.payment_mode === 'Cash').reduce((sum, p) => sum + Number(p.amount), 0),
    upi: customerPayments.filter((p) => p.payment_mode === 'UPI').reduce((sum, p) => sum + Number(p.amount), 0),
    bank: customerPayments.filter((p) => p.payment_mode === 'Bank Transfer').reduce((sum, p) => sum + Number(p.amount), 0),
  };

  // WhatsApp Statement share
  const handleShareStatementWhatsApp = () => {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const message = (
      `*KBN TRADERS - ACCOUNT STATEMENT & DUES*\n` +
      `Customer: *${customer.name}*\n` +
      `Phone: ${customer.phone}\n` +
      `Date: ${new Date().toLocaleDateString('en-IN')}\n` +
      `--------------------------------\n` +
      `Opening Balance: ₹${Number(customer.opening_balance).toLocaleString('en-IN')}\n` +
      `Total Invoices Billed: ₹${totalBilled.toLocaleString('en-IN')} (${customerInvoices.length} bills)\n` +
      `Total Payments Recorded: ₹${totalCollections.toLocaleString('en-IN')}\n` +
      `*Net Current Balance: ₹${Math.abs(currentBal).toLocaleString('en-IN')}*\n` +
      `Status: ${isDue ? '*DUE PENDING (RECEIVABLE)*' : isAdvance ? '*ADVANCE DEPOSIT CREDIT*' : '*SETTLED / NIL BALANCE*'}\n` +
      `--------------------------------\n` +
      `For queries or immediate bill copy, contact KBN Traders APMC Mandi Office.`
    );
    const url = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Export Customer Statement PDF
  const handleExportStatementPDF = () => {
    downloadCustomerLedgerPDF(customer, finalStatementRows, 'KBN Traders');
  };

  // Export Customer Statement CSV
  const handleExportStatementCSV = () => {
    const headers = ['Date', 'Reference / Bill #', 'Particulars', 'Debit (₹)', 'Credit (₹)', 'Running Balance (₹)'];
    const rows = finalStatementRows.map((r) => [
      r.date,
      r.reference,
      r.description,
      r.debit || 0,
      r.credit || 0,
      r.running_balance,
    ]);
    downloadCSV(`${customer.name.replace(/\s+/g, '_')}_Statement`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="p-2 sm:px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            title="Return to customer cards directory"
          >
            <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
            <span className="text-xs font-bold">Back to Directory</span>
          </Button>

          <div className="border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <Badge
                variant={isDue ? 'danger' : isAdvance ? 'success' : 'neutral'}
                size="sm"
                className="font-bold tracking-wide"
              >
                {isDue
                  ? `₹${currentBal.toLocaleString('en-IN')} Due Pending`
                  : isAdvance
                  ? `₹${Math.abs(currentBal).toLocaleString('en-IN')} Advance Credit`
                  : 'Account Settled'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap font-mono">
              <span>APMC Customer ID: #{customer.id}</span>
              <span>•</span>
              <span className="text-teal-700 font-semibold">{customer.status} Account</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenRecordPayment(customer.id)}
            className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-xs font-bold py-2"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenNewInvoice(customer.id)}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-xs font-bold py-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Produce Bill</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShareStatementWhatsApp}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent text-xs font-semibold py-2"
            title="Share account balance & dues on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">WhatsApp</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportStatementPDF}
            className="bg-white border-slate-200 text-slate-700 text-xs font-semibold py-2"
            title="Download PDF statement"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden md:inline">PDF</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditCustomer(customer)}
            className="text-slate-600 hover:bg-slate-100 text-xs py-2 px-2.5"
            title="Edit Customer Details"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Edit</span>
          </Button>
        </div>
      </div>

      {/* 2. CUSTOMER PROFILE & CONTACT BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contact details */}
        <Card className="p-4 bg-white border border-slate-200 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Customer Information & Mandi Account</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                  <a
                    href={`tel:${customer.phone}`}
                    className="font-mono font-bold text-slate-800 hover:text-teal-600 truncate block"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <span className="text-slate-800 font-medium truncate block">
                    {customer.email || 'Not registered'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 sm:col-span-2">
                <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandi Yard / Shop Address</span>
                  <span className="text-slate-800 font-medium block">
                    {customer.address || 'APMC Yard Mandi stall'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-3 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block mb-0.5">
                Trading Notes & Terms
              </span>
              <p>{customer.notes}</p>
            </div>
          )}
        </Card>

        {/* Quick Payment Mode Split */}
        <Card className="p-4 bg-white border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
                Payment Collections Split
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {customerPayments.length} Receipts
              </span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  UPI (PhonePe / GPay)
                </span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(collectionsByMode.upi)}</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Cash Receipts
                </span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(collectionsByMode.cash)}</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Bank NEFT / IMPS
                </span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(collectionsByMode.bank)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">Total Settled:</span>
            <span className="text-emerald-700 font-mono text-sm">{formatCurrency(totalCollections)}</span>
          </div>
        </Card>
      </div>

      {/* 3. FOUR FINANCIAL KPIS (DUE DETAILS, SALES DETAILS, COLLECTIONS, OPENING) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: NET CURRENT DUE BALANCE */}
        <Card className={`p-4 border transition-all ${isDue ? 'bg-amber-50/40 border-amber-200' : isAdvance ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Net Current Balance</span>
            <Badge variant={isDue ? 'danger' : isAdvance ? 'success' : 'neutral'} size="sm">
              {isDue ? 'Due Pending' : isAdvance ? 'Credit Advance' : 'Settled'}
            </Badge>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <p className={`text-2xl font-bold font-mono ${isDue ? 'text-amber-800' : isAdvance ? 'text-emerald-700' : 'text-slate-800'}`}>
              {formatCurrency(currentBal)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {isDue
              ? 'Amount to collect from customer'
              : isAdvance
              ? 'Pre-deposit available for future orders'
              : 'All accounts balanced'}
          </p>
        </Card>

        {/* KPI 2: TOTAL LIFETIME SALES */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Sales Invoiced</span>
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(totalBilled)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Across {customerInvoices.length} invoices ({paidInvoicesCount} paid, {pendingInvoicesCount} pending)
          </p>
        </Card>

        {/* KPI 3: TOTAL PAYMENTS COLLECTED */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Collections</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatCurrency(totalCollections)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Recorded via Cash, UPI & Bank Transfer
          </p>
        </Card>

        {/* KPI 4: OPENING BALANCE */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Opening Balance</span>
            <span className="p-1.5 bg-slate-50 text-slate-600 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">
            {formatCurrency(customer.opening_balance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Previous season carry-forward entry
          </p>
        </Card>
      </div>

      {/* 4. DETAIL NAVIGATION TABS */}
      <div className="flex items-center border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Details Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoice Details ({customerInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dues')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dues'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Due Details & Running Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sales'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Sales & Variety Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payment Receipts ({customerPayments.length})</span>
        </button>
      </div>

      {/* 5. TAB CONTENT: INVOICE DETAILS */}
      {(activeTab === 'all' || activeTab === 'invoices') && (
        <Card className="p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <span>Invoice Details & Produce Bills</span>
              </h2>
              <p className="text-xs text-slate-500">
                Itemized bills with varieties (A1, A2, SPL, etc.), weight in Kg and boxes, rates and balance dues.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter bills..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 w-36 sm:w-48"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenNewInvoice(customer.id)}
                className="text-xs font-semibold py-1 bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bill</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Produce Varieties & Items</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Paid (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance Due (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No invoices recorded for this customer yet.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const rawItems = (inv.items || inv.produceItems || []) as any[];
                    const grandTotal = Number(inv.total || 0);
                    const paid = Number(inv.paidAmount || 0);
                    const balDue = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, grandTotal - paid));

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(inv.date)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs sm:max-w-md">
                            {rawItems.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                              >
                                <span className="font-bold text-teal-700">{item.variety || 'A1'}</span>:
                                <span>
                                  {item.unit === 'Box'
                                    ? `${item.boxes || item.quantity} Box (${item.weight_kg ? `${item.weight_kg}kg` : ''})`
                                    : `${item.weight_kg || item.quantity} Kg`}
                                </span>
                                <span className="text-slate-400">@ ₹{item.rate}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-600 whitespace-nowrap">
                          {formatCurrency(paid)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 whitespace-nowrap">
                          {formatCurrency(balDue)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <Badge
                            variant={
                              inv.status === 'Paid'
                                ? 'success'
                                : inv.status === 'Partial'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100"
                              title="View Invoice Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPrintingInvoice(inv)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              title="Print Thermal 80mm or A4"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadInvoicePDF(inv, 'KBN Traders')}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100"
                              title="Download PDF Invoice"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. TAB CONTENT: DUE DETAILS & RUNNING LEDGER */}
      {(activeTab === 'all' || activeTab === 'dues') && (
        <Card className="p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Due Details & Chronological Running Ledger</span>
              </h2>
              <p className="text-xs text-slate-500">
                Complete debit/credit audit trail with dynamic running balance calculation.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    dateFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    dateFilter === 'month' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setDateFilter('30days')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    dateFilter === '30days' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportStatementCSV}
                className="text-xs py-1 px-2.5 bg-white border-slate-200 text-slate-700"
              >
                CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportStatementPDF}
                className="text-xs py-1 px-2.5 bg-white border-slate-200 text-rose-600"
              >
                PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference / Bill #</th>
                  <th className="py-2.5 px-3">Particulars & Description</th>
                  <th className="py-2.5 px-3 text-right">Debit / Sales (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit / Receipts (₹)</th>
                  <th className="py-2.5 px-3 text-right">Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalStatementRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No ledger statement entries found for the selected period.
                    </td>
                  </tr>
                ) : (
                  finalStatementRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                        {row.reference}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-sm truncate">
                        {row.description}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                        {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span
                          className={
                            row.running_balance > 0
                              ? 'text-amber-700'
                              : row.running_balance < 0
                              ? 'text-emerald-700'
                              : 'text-slate-600'
                          }
                        >
                          {formatCurrency(row.running_balance)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 7. TAB CONTENT: SALES & VARIETY BREAKDOWN */}
      {(activeTab === 'all' || activeTab === 'sales') && (
        <Card className="p-4 sm:p-5 bg-white border border-slate-200">
          <div className="mb-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600" />
              <span>Sales & Variety Breakdown for {customer.name}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Breakdown of produce varieties purchased (A1, A2, A3, SPL, Loosu) with total weight in Kg, boxes, and revenue.
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Variety Code</th>
                  <th className="py-2.5 px-3">Variety Description</th>
                  <th className="py-2.5 px-3 text-right">Total Boxes</th>
                  <th className="py-2.5 px-3 text-right">Total Weight (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue (₹)</th>
                  <th className="py-2.5 px-3 text-right">Share of Purchases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerVarietyStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No variety purchase data recorded for this customer yet.
                    </td>
                  </tr>
                ) : (
                  customerVarietyStats.map((stat) => {
                    const sharePct = totalBilled > 0 ? Math.round((stat.revenue / totalBilled) * 100) : 0;
                    return (
                      <tr key={stat.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-xs">
                            {stat.code}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {stat.name}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {stat.totalBoxes > 0 ? `${stat.totalBoxes} Boxes` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {stat.totalKg > 0 ? `${stat.totalKg.toLocaleString('en-IN')} Kg` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(stat.revenue)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-teal-600 h-2 rounded-full"
                                style={{ width: `${Math.min(100, sharePct)}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-600 w-8 text-right font-bold">{sharePct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 8. TAB CONTENT: PAYMENT COLLECTIONS */}
      {(activeTab === 'all' || activeTab === 'payments') && (
        <Card className="p-4 sm:p-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Payment & Collection Receipts</span>
              </h2>
              <p className="text-xs text-slate-500">
                All collections received from {customer.name} via Cash, UPI, and Bank Transfer.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenRecordPayment(customer.id)}
              className="text-xs font-semibold py-1 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </Button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Receipt #</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Transaction Reference</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Amount Paid (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No payment receipts recorded for this customer yet.
                    </td>
                  </tr>
                ) : (
                  customerPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                        {p.payment_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.payment_mode === 'UPI'
                                ? 'bg-teal-500'
                                : p.payment_mode === 'Cash'
                                ? 'bg-emerald-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          {p.payment_mode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {p.transaction_ref || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {p.notes || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        +{formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* INVOICE VIEWER MODAL */}
      <InvoiceViewerModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        onUpdateStatus={() => {}}
      />

      {/* PRINTABLE INVOICE MODAL (80mm & A4) */}
      <PrintableInvoiceModal
        isOpen={Boolean(printingInvoice)}
        onClose={() => setPrintingInvoice(null)}
        invoice={printingInvoice}
        previousDue={customer.current_balance}
      />
    </div>
  );
}
