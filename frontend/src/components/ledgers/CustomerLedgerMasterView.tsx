import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  FileDown,
  FileText,
  Share2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Customer, CustomerLedgerRow, Invoice, PaymentRecord, ProduceVariety } from '../../types';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { downloadCustomerLedgerPDF } from '../../utils/pdfGenerator';
import { CustomerDetailView } from './CustomerDetailView';

interface CustomerLedgerMasterViewProps {
  customers: Customer[];
  invoices?: Invoice[];
  payments?: PaymentRecord[];
  varieties?: ProduceVariety[];
  onAddCustomer: (customer: any) => Promise<any>;
  onUpdateCustomer: (id: string, customer: any) => Promise<any>;
  onOpenNewInvoice: (customerId?: string) => void;
  onOpenRecordPayment: (customerId?: string) => void;
  getCustomerLedgerStatement: (customerId: string) => {
    customer: Customer | undefined;
    rows: CustomerLedgerRow[];
    totalDebit: number;
    totalCredit: number;
    currentBalance: number;
  };
}

export function CustomerLedgerMasterView({
  customers,
  invoices = [],
  payments = [],
  varieties = [],
  onAddCustomer,
  onUpdateCustomer,
  onOpenNewInvoice,
  onOpenRecordPayment,
  getCustomerLedgerStatement,
}: CustomerLedgerMasterViewProps) {
  const { customerId: urlCustomerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();

  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(() => {
    if (urlCustomerId) {
      return customers.find((c) => c.id === urlCustomerId) || null;
    }
    return null;
  });

  // Sync if URL param changes
  useEffect(() => {
    if (urlCustomerId) {
      const found = customers.find((c) => c.id === urlCustomerId);
      if (found) setSelectedCustomerForDetail(found);
    } else {
      setSelectedCustomerForDetail(null);
    }
  }, [urlCustomerId, customers]);

  const [activeTab, setActiveTab] = useState<'directory' | 'statement'>('directory');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => customers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | '30days'>('all');

  // Add / Edit Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState('0');
  const [formNotes, setFormNotes] = useState('');

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingCustomerId(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormOpeningBalance('0');
    setFormNotes('');
    setIsCustomerModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomerId(cust.id);
    setFormName(cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email || '');
    setFormAddress(cust.address || '');
    setFormOpeningBalance(String(cust.opening_balance || 0));
    setFormNotes(cust.notes || '');
    setIsCustomerModalOpen(true);
  };

  // Handle Save
  const handleCustomerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    if (editingCustomerId) {
      await onUpdateCustomer(editingCustomerId, {
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        notes: formNotes,
      });
    } else {
      await onAddCustomer({
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        opening_balance: parseFloat(formOpeningBalance) || 0,
        notes: formNotes,
      });
    }

    setIsCustomerModalOpen(false);
  };

  // Open Customer Detail View
  const handleSelectCustomerCard = (cust: Customer) => {
    setSelectedCustomerForDetail(cust);
    navigate(`/customer-ledger/${cust.id}`);
  };

  const handleBackToDirectory = () => {
    setSelectedCustomerForDetail(null);
    navigate('/customer-ledger');
  };

  // Switch to Statement view for a customer
  const handleViewCustomerStatement = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      handleSelectCustomerCard(cust);
    } else {
      setSelectedCustomerId(customerId);
      setActiveTab('statement');
    }
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Current Statement Data
  const statementData = useMemo(() => {
    if (!selectedCustomerId) return null;
    return getCustomerLedgerStatement(selectedCustomerId);
  }, [selectedCustomerId, getCustomerLedgerStatement]);

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

  // Export Customer Ledger CSV
  const handleExportStatementCSV = () => {
    if (!statementData?.customer) return;
    const cust = statementData.customer;
    const headers = ['Date', 'Reference / Bill #', 'Particulars', 'Debit (₹)', 'Credit (₹)', 'Running Balance (₹)'];
    const rows = finalStatementRows.map((r) => [
      r.date,
      r.reference,
      r.description,
      r.debit || 0,
      r.credit || 0,
      r.running_balance,
    ]);
    downloadCSV(`${cust.name.replace(/\s+/g, '_')}_Ledger_Statement`, headers, rows);
  };

  // Export Customer Ledger PDF
  const handleExportStatementPDF = () => {
    if (!statementData?.customer) return;
    downloadCustomerLedgerPDF(statementData.customer, finalStatementRows, 'KBN Traders');
  };

  // Share Statement on WhatsApp
  const handleShareStatementWhatsApp = () => {
    if (!statementData?.customer) return;
    const cust = statementData.customer;
    const cleanPhone = cust.phone.replace(/\D/g, '');
    const currentDue = Number(cust.current_balance);

    const message = (
      `*KBN TRADERS - ACCOUNT STATEMENT*\n` +
      `Customer: *${cust.name}*\n` +
      `Phone: ${cust.phone}\n` +
      `Date: ${new Date().toLocaleDateString('en-IN')}\n` +
      `--------------------------------\n` +
      `Opening Balance: ₹${Number(cust.opening_balance).toLocaleString('en-IN')}\n` +
      `Total Billed: ₹${Number(cust.total_sales).toLocaleString('en-IN')}\n` +
      `Total Paid: ₹${Number(cust.total_paid).toLocaleString('en-IN')}\n` +
      `*Net Outstanding Balance: ₹${currentDue.toLocaleString('en-IN')}*\n` +
      `Status: ${currentDue > 0 ? '*DUE RECEIVABLE*' : currentDue < 0 ? '*ADVANCE CREDIT*' : '*SETTLED*'}\n` +
      `--------------------------------\n` +
      `For queries, please contact KBN Traders APMC Mandi Office.`
    );

    const url = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Summary Metrics across all customers
  const totalReceivables = customers
    .filter((c) => Number(c.current_balance) > 0)
    .reduce((sum, c) => sum + Number(c.current_balance), 0);

  const totalAdvances = customers
    .filter((c) => Number(c.current_balance) < 0)
    .reduce((sum, c) => sum + Math.abs(Number(c.current_balance)), 0);

  // IF A CUSTOMER IS SELECTED: RENDER DEDICATED CUSTOMER DETAIL PAGE
  if (selectedCustomerForDetail) {
    return (
      <div className="space-y-6">
        <CustomerDetailView
          customer={selectedCustomerForDetail}
          invoices={invoices}
          payments={payments}
          varieties={varieties}
          onBack={handleBackToDirectory}
          onOpenNewInvoice={onOpenNewInvoice}
          onOpenRecordPayment={onOpenRecordPayment}
          onEditCustomer={handleOpenEditModal}
          getCustomerLedgerStatement={getCustomerLedgerStatement}
        />

        {/* Edit Customer Modal if opened from detail page */}
        <Modal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          title={editingCustomerId ? 'Edit Customer' : 'Add New Customer'}
          subtitle="Manage Mandi counterparty with phone number and opening balance"
          maxWidth="lg"
        >
          <form onSubmit={handleCustomerFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Customer / Business Name *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Traders"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="rajesh@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Opening Balance (₹)</label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={formOpeningBalance}
                  onChange={(e) => setFormOpeningBalance(e.target.value)}
                  disabled={Boolean(editingCustomerId)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Shop / APMC Yard Address
              </label>
              <Input
                type="text"
                placeholder="Shop #14, APMC Market Yard"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Terms</label>
              <textarea
                rows={2}
                placeholder="Weekly settlement buyer..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsCustomerModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#0d9488] hover:bg-[#0f766e]">
                {editingCustomerId ? 'Update Customer' : 'Save Customer'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Customer Management & Running Ledgers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Individual customer statements, opening balances, running balances, debits and credits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenRecordPayment()}
            className="bg-white border border-slate-200 text-xs font-semibold py-2"
          >
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
            <span>Record Payment</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-xs font-semibold py-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </Button>
        </div>
      </div>

      {/* Top Aggregates Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 bg-white border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Customer Accounts</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{customers.length}</p>
          </div>
          <span className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="w-5 h-5" />
          </span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Dues (Receivables)</p>
            <p className="text-xl font-bold text-amber-700 font-mono mt-0.5">{formatCurrency(totalReceivables)}</p>
          </div>
          <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/90 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Advance Balances Deposited</p>
            <p className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{formatCurrency(totalAdvances)}</p>
          </div>
          <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </Card>
      </div>

      {/* Navigation Segment: Customer Directory vs Individual Ledger Statement */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory & Dues ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'statement'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Customer-wise Ledger Statement</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => {
              const curBal = Number(cust.current_balance);
              const isDue = curBal > 0;
              const isAdvance = curBal < 0;

              return (
                <Card
                  key={cust.id}
                  onClick={() => handleSelectCustomerCard(cust)}
                  className="p-4 hover:shadow-lg hover:border-teal-400 transition-all flex flex-col justify-between cursor-pointer group bg-white border border-slate-200"
                  title="Click to view all invoice, due, sales & payment details"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors truncate">
                          {cust.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cust.phone}</span>
                        </p>
                      </div>

                      <Badge
                        variant={isDue ? 'danger' : isAdvance ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {isDue ? 'Dues Pending' : isAdvance ? 'Advance Credit' : 'Clear'}
                      </Badge>
                    </div>

                    {cust.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                      </p>
                    )}

                    {/* Opening & Current Balance Row */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 my-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Opening Balance</span>
                        <span className="font-mono font-bold text-slate-700">{formatCurrency(cust.opening_balance)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Balance</span>
                        <span
                          className={`font-mono font-bold ${
                            isDue ? 'text-amber-700' : isAdvance ? 'text-emerald-700' : 'text-slate-700'
                          }`}
                        >
                          {formatCurrency(curBal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSelectCustomerCard(cust)}
                      className="text-xs bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100 font-bold py-1 px-2.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>View Details</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenRecordPayment(cust.id)}
                        className="text-xs py-1 px-2 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold"
                      >
                        <DollarSign className="w-3 h-3" />
                        Pay
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(cust)}
                        className="text-xs py-1 px-2 text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER-WISE LEDGER STATEMENT */}
      {activeTab === 'statement' && statementData && (
        <div className="space-y-4">
          {/* Customer Selector & Statement Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
                Select Customer:
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - Due: {formatCurrency(c.current_balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters & Exports */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    dateFilter === 'all' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    dateFilter === 'month' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setDateFilter('30days')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    dateFilter === '30days' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportStatementCSV}
                className="text-xs bg-white border border-slate-200 py-1 px-2.5"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600" />
                CSV / Excel
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportStatementPDF}
                className="text-xs bg-white border border-slate-200 py-1 px-2.5"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                PDF Statement
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleShareStatementWhatsApp}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Customer Ledger Profile Card */}
          {statementData.customer && (
            <Card className="p-4 bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border border-teal-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{statementData.customer.name}</h2>
                    <Badge variant={statementData.customer.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {statementData.customer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                    <span className="font-mono">{statementData.customer.phone}</span>
                    <span>•</span>
                    <span>{statementData.customer.address || 'APMC Yard'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs w-full md:w-auto">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Opening Balance</span>
                    <span className="font-mono font-bold text-slate-700">{formatCurrency(statementData.customer.opening_balance)}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Debits (Sales)</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(statementData.totalDebit)}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Credits (Paid)</span>
                    <span className="font-mono font-bold text-emerald-600">{formatCurrency(statementData.totalCredit)}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Running Due</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        statementData.currentBalance > 0
                          ? 'text-amber-700'
                          : statementData.currentBalance < 0
                          ? 'text-emerald-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatCurrency(statementData.currentBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Statement Table with Date, Invoice/Ref, Debit, Credit, and Running Balance */}
          <Card className="overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Ledger Account Statement
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {finalStatementRows.length} entries recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Ref / Invoice #</th>
                    <th className="py-2.5 px-4 font-semibold">Particulars / Variety Breakdown</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Debit (Sales ₹)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Credit (Paid ₹)</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Running Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {finalStatementRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No transactions recorded for this customer in selected period.
                      </td>
                    </tr>
                  ) : (
                    finalStatementRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 text-slate-500 font-mono">{formatDate(row.date)}</td>
                        <td className="py-3 px-3 font-bold text-slate-800 font-mono">{row.reference}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium max-w-xs">{row.description}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600">
                          {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                        </td>
                        <td
                          className={`py-3 px-3.5 text-right font-mono font-bold ${
                            row.running_balance > 0
                              ? 'text-amber-800'
                              : row.running_balance < 0
                              ? 'text-emerald-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {formatCurrency(row.running_balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Customer Add / Edit Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomerId ? 'Edit Customer Profile' : 'Register New Customer Account'}
        subtitle="Manage Mandi counterparty with phone number and opening balance"
        maxWidth="md"
      >
        <form onSubmit={handleCustomerFormSubmit} className="space-y-4">
          <Input
            label="Customer / Mandi Business Name *"
            placeholder="e.g. Rajesh Traders"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone (WhatsApp) *"
              placeholder="+91 98765 43210"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              required
            />
            <Input
              label="Contact Email (Optional)"
              type="email"
              placeholder="rajesh@trade.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>

          <Input
            label="Mandi / Shop Address"
            placeholder="Shop #14, APMC Market Yard"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

          {!editingCustomerId && (
            <div>
              <Input
                label="Opening Balance (₹) [Positive = Due, Negative = Advance]"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formOpeningBalance}
                onChange={(e) => setFormOpeningBalance(e.target.value)}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Enter previous outstanding amount. If customer already paid advance, enter with minus sign (e.g. -5000).
              </span>
            </div>
          )}

          <Input
            label="Account Notes / Payment Terms"
            placeholder="e.g. Weekly settlement on Saturdays"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-[#0d9488]">
              {editingCustomerId ? 'Update Profile' : 'Register Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
