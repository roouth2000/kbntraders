import { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Share2,
  Trash2,
  Printer,
  FileDown,
  Search,
  Receipt,
  User,
  Scale,
  Box,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Invoice, InvoiceStatus, Customer } from '../../types';
import { formatCurrency, formatDate, downloadCSV } from '../../utils/formatters';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import { InvoiceViewerModal } from '../billing/InvoiceViewerModal';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface SalesLedgerViewProps {
  invoices: Invoice[];
  customers?: Customer[];
  onOpenCreateInvoice: () => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (id: string) => void;
  searchQuery?: string;
}

export function SalesLedgerView({
  invoices,
  customers = [],
  onOpenCreateInvoice,
  onViewInvoice,
  onUpdateStatus,
  onDeleteInvoice,
  searchQuery: externalSearch = '',
}: SalesLedgerViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Pending' | 'Overdue'>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const effectiveSearch = (externalSearch || localSearch).trim().toLowerCase();

  // Filter sales invoices only
  const salesInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.type === 'sales');
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter((inv) => {
      const matchesStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Partial'
          ? inv.status === 'Partial'
          : statusFilter === 'Paid'
          ? inv.status === 'Paid'
          : statusFilter === 'Pending'
          ? inv.status === 'Pending'
          : inv.status === 'Overdue';

      const itemsStr = (inv.items || (inv as any).produceItems || [])
        .map((it: any) => `${it.variety || it.description || ''} ${it.unit || ''}`)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !effectiveSearch ||
        inv.invoiceNumber.toLowerCase().includes(effectiveSearch) ||
        (inv.partyName && inv.partyName.toLowerCase().includes(effectiveSearch)) ||
        ((inv as any).customer_name && (inv as any).customer_name.toLowerCase().includes(effectiveSearch)) ||
        (inv.partyPhone && inv.partyPhone.includes(effectiveSearch)) ||
        itemsStr.includes(effectiveSearch);

      return matchesStatus && matchesSearch;
    });
  }, [salesInvoices, statusFilter, effectiveSearch]);

  // Calculate high-level financial metrics
  const totalSales = salesInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidSales = salesInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || (inv.status === 'Paid' ? inv.total : 0) || 0), 0);
  const pendingSales = Math.max(0, totalSales - paidSales);
  const overdueCount = salesInvoices.filter((inv) => inv.status === 'Overdue').length;

  // View Invoice Handler
  const handleView = (inv: Invoice) => {
    if (onViewInvoice) {
      onViewInvoice(inv);
    } else {
      setSelectedInvoice(inv);
    }
  };

  // WhatsApp share link generator
  const handleWhatsAppShare = (inv: Invoice) => {
    const cust = customers.find((c) => c.name === inv.partyName || c.id === inv.customerId);
    const phone = (cust?.phone || inv.partyPhone || '').replace(/[^0-9]/g, '');

    const items = inv.items || (inv as any).produceItems || [];
    const itemsLines = items
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

    const total = Number(inv.total || 0);
    const paid = Number(inv.paidAmount || 0);
    const balDue = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, total - paid));

    const msg =
      `*KBN TRADERS - BILL INVOICE*\n` +
      `Invoice: *#${inv.invoiceNumber}*\n` +
      `Date: ${formatDate(inv.date)}\n` +
      `Customer: *${inv.partyName}* (${phone || 'N/A'})\n` +
      `--------------------------------\n` +
      `*Items Breakdown:*\n` +
      `${itemsLines}\n` +
      `--------------------------------\n` +
      `Subtotal: ₹${Number(inv.subtotal || 0).toLocaleString('en-IN')}\n` +
      (Number(inv.discount || 0) > 0 ? `Discount: -₹${Number(inv.discount).toLocaleString('en-IN')}\n` : '') +
      `*Total Bill: ₹${total.toLocaleString('en-IN')}*\n` +
      `Amount Paid: ₹${paid.toLocaleString('en-IN')} (${inv.paymentMode || 'Cash'})\n` +
      `*Balance Due: ₹${balDue.toLocaleString('en-IN')}*\n` +
      `--------------------------------\n` +
      `Thank you for doing business with KBN Traders!`;

    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    toast.success('Opening WhatsApp with formatted bill text...');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Invoice #',
      'Customer Name',
      'Phone',
      'Date',
      'Due Date',
      'Total Amount (₹)',
      'Paid Amount (₹)',
      'Balance Due (₹)',
      'Status',
      'Payment Mode',
    ];
    const rows = filteredInvoices.map((inv) => {
      const cust = customers.find((c) => c.name === inv.partyName || c.id === inv.customerId);
      const paid = Number(inv.paidAmount || (inv.status === 'Paid' ? inv.total : 0) || 0);
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, inv.total - paid));
      return [
        inv.invoiceNumber,
        inv.partyName,
        cust?.phone || inv.partyPhone || '',
        inv.date,
        inv.dueDate,
        inv.total,
        paid,
        bal,
        inv.status,
        inv.paymentMode || 'Cash',
      ];
    });
    downloadCSV('KBN_Traders_Invoices', headers, rows);
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Teal Header
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KBN TRADERS - SALES INVOICES REPORT', 14, 15);

    let y = 35;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoices Summary (${filteredInvoices.length} Bills)`, 14, y);

    y += 8;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('INVOICE #', 18, y + 5);
    doc.text('CUSTOMER', 55, y + 5);
    doc.text('DATE', 105, y + 5);
    doc.text('TOTAL (₹)', 135, y + 5, { align: 'right' });
    doc.text('PAID (₹)', 160, y + 5, { align: 'right' });
    doc.text('DUE (₹)', pageWidth - 18, y + 5, { align: 'right' });

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    filteredInvoices.forEach((inv, idx) => {
      const paid = Number(inv.paidAmount || (inv.status === 'Paid' ? inv.total : 0) || 0);
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, inv.total - paid));

      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }

      doc.setTextColor(13, 148, 136);
      doc.setFont('helvetica', 'bold');
      doc.text(inv.invoiceNumber, 18, y + 4.5);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(inv.partyName.slice(0, 24), 55, y + 4.5);

      doc.text(inv.date, 105, y + 4.5);
      doc.text(formatCurrency(inv.total), 135, y + 4.5, { align: 'right' });
      doc.text(formatCurrency(paid), 160, y + 4.5, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(bal > 0 ? 217 : 16, bal > 0 ? 119 : 185, bal > 0 ? 6 : 129);
      doc.text(formatCurrency(bal), pageWidth - 18, y + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      y += 6.5;
    });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated electronically by KBN Traders Mandi Suite', 14, pageHeight - 9);
    doc.text('Page 1 of 1', pageWidth - 14, pageHeight - 9, { align: 'right' });

    doc.save('KBN_Traders_Invoices.pdf');
  };

  const getVarietyBadgeStyle = (code: string) => {
    switch (code) {
      case 'A1':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'A2':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'A3':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'SPL':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Loosu':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header & Create Invoice CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Invoices
            </h1>
            <Badge variant="teal" size="sm">
              {salesInvoices.length} Bills
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, view, print, and track customer produce bills (A1, A2, A3, SPL, Loosu) with instant WhatsApp sharing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 text-xs font-semibold py-2 shadow-xs hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Excel / CSV</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="bg-white border border-slate-200 text-xs font-semibold py-2 shadow-xs hover:bg-slate-50"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span>Export PDF</span>
          </Button>

          {/* MAIN PROMINENT CREATE INVOICE BUTTON */}
          <Button
            variant="primary"
            onClick={onOpenCreateInvoice}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Invoice</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Billed Sales</span>
            <span className="p-1 sm:p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Receipt className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalSales)}</p>
          <p className="text-[10px] sm:text-[11px] text-teal-600 font-medium mt-0.5 sm:mt-1">
            Across {salesInvoices.length} total bills
          </p>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Settled / Collected</span>
            <span className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-emerald-700 font-mono">{formatCurrency(paidSales)}</p>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 sm:mt-1">Cash / UPI / Bank</p>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Outstanding Balance Dues</span>
            <span className="p-1 sm:p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-amber-700 font-mono">{formatCurrency(pendingSales)}</p>
          <p className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5 sm:mt-1">Pending collection</p>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Overdue Invoices</span>
            <span className="p-1 sm:p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-rose-700 font-mono">{overdueCount}</p>
          <p className="text-[10px] sm:text-[11px] text-rose-500 font-medium mt-0.5 sm:mt-1">
            {overdueCount > 0 ? 'Follow-up required' : 'All accounts healthy'}
          </p>
        </Card>
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Paid', 'Partial', 'Pending', 'Overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, customer, variety..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Desktop Invoices Table */}
      <div className="hidden md:block">
        <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Invoice #</th>
                  <th className="py-3.5 px-4 font-semibold">Customer / Buyer</th>
                  <th className="py-3.5 px-3 font-semibold">Date</th>
                  <th className="py-3.5 px-3 font-semibold">Produce Varieties</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Total (₹)</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Paid (₹)</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Balance Due (₹)</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">No invoices found</p>
                        <p className="text-xs text-slate-400">
                          {effectiveSearch ? 'Try clearing your search query.' : 'Create your first produce bill.'}
                        </p>
                        {!effectiveSearch && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={onOpenCreateInvoice}
                            className="mt-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Create Invoice Now
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const cust = customers.find((c) => c.name === inv.partyName || c.id === inv.customerId);
                    const paid = Number(inv.paidAmount || (inv.status === 'Paid' ? inv.total : 0) || 0);
                    const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, inv.total - paid));
                    const items = inv.items || (inv as any).produceItems || [];

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Invoice # */}
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                          <button
                            onClick={() => handleView(inv)}
                            className="hover:underline flex items-center gap-1 text-left font-mono"
                          >
                            <span>{inv.invoiceNumber}</span>
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-xs">{inv.partyName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {cust?.phone || inv.partyPhone || 'No Phone'}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                          {formatDate(inv.date)}
                        </td>

                        {/* Variety Items */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {items.length === 0 ? (
                              <span className="text-[11px] text-slate-400">Standard Produce</span>
                            ) : (
                              items.map((it: any, i: number) => {
                                const vCode = it.variety || it.description || 'A1';
                                const qtyStr = it.unit === 'Box'
                                  ? `${it.boxes || 0}B`
                                  : `${it.weight_kg || it.quantity || 0}Kg`;
                                return (
                                  <span
                                    key={i}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getVarietyBadgeStyle(vCode)}`}
                                  >
                                    {vCode}: {qtyStr}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono text-sm">
                          {formatCurrency(inv.total)}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-700 text-xs">
                          {formatCurrency(paid)}
                        </td>

                        {/* Balance Due */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-xs">
                          <span className={bal > 0 ? 'text-amber-700' : 'text-slate-400'}>
                            {formatCurrency(bal)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 text-center">
                          <Badge
                            variant={
                              inv.status === 'Paid'
                                ? 'success'
                                : inv.status === 'Partial'
                                ? 'teal'
                                : inv.status === 'Pending'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {inv.status}
                          </Badge>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View & Print Modal Button */}
                            <button
                              onClick={() => handleView(inv)}
                              title="Print & View Bill (Thermal & A4)"
                              className="p-1.5 text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Share Button */}
                            <button
                              onClick={() => handleWhatsAppShare(inv)}
                              title="Share on WhatsApp"
                              className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Download PDF Button */}
                            <button
                              onClick={() => downloadInvoicePDF(inv, 'KBN Traders')}
                              title="Download PDF"
                              className="p-1.5 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Mark Paid */}
                            {inv.status !== 'Paid' && (
                              <button
                                onClick={() => onUpdateStatus(inv.id, 'Paid')}
                                title="Mark as Paid"
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete / Void */}
                            <button
                              onClick={() => setDeletingInvoice(inv)}
                              title="Delete Invoice"
                              className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      </div>

      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card className="py-10 text-center text-slate-400 text-xs">
            <p>No invoices found.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateInvoice}
              className="mt-3 bg-[#0d9488] text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Invoice
            </Button>
          </Card>
        ) : (
          filteredInvoices.map((inv) => {
            const cust = customers.find((c) => c.name === inv.partyName || c.id === inv.customerId);
            const paid = Number(inv.paidAmount || (inv.status === 'Paid' ? inv.total : 0) || 0);
            const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, inv.total - paid));

            return (
              <Card key={inv.id} className="p-4 bg-white space-y-3 border border-slate-200/90">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-teal-800 px-2.5 py-1 rounded-md">
                    {inv.invoiceNumber}
                  </span>
                  <Badge
                    variant={
                      inv.status === 'Paid'
                        ? 'success'
                        : inv.status === 'Partial'
                        ? 'teal'
                        : inv.status === 'Pending'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {inv.status}
                  </Badge>
                </div>

                <div>
                  <p className="font-bold text-sm text-slate-900">{inv.partyName}</p>
                  <p className="text-xs text-slate-400 font-mono">{cust?.phone || inv.partyPhone}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Amount</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {formatCurrency(inv.total)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Balance Due</span>
                    <span className={`text-base font-bold font-mono ${bal > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatCurrency(bal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(inv)}
                    className="flex-1 py-2 text-xs text-teal-700 border-teal-300 min-h-[38px] active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    <span>Print</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleWhatsAppShare(inv)}
                    className="px-3 py-2 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 min-h-[38px] active:scale-95 font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    <span>WhatsApp</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingInvoice(inv)}
                    className="px-2.5 py-2 text-xs text-red-500 hover:bg-red-50 min-h-[38px] active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Invoice Viewer Modal Fallback */}
      <InvoiceViewerModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onUpdateStatus={onUpdateStatus}
      />

      {/* Delete Invoice Confirmation Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-sm font-bold">Void / Delete Invoice</h2>
              </div>
              <button
                onClick={() => setDeletingInvoice(null)}
                className="p-1 hover:bg-red-700 rounded-lg transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700">
                Are you sure you want to void and delete invoice{' '}
                <strong className="font-mono text-red-600">{deletingInvoice.invoiceNumber}</strong> (
                {deletingInvoice.partyName})?
              </p>
              <p className="text-[11px] text-slate-500 bg-red-50 p-2.5 rounded-lg border border-red-200">
                This will remove the invoice bill and roll back any linked customer ledger debits.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeletingInvoice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onDeleteInvoice(deletingInvoice.id);
                    setDeletingInvoice(null);
                    toast.success(`Invoice ${deletingInvoice.invoiceNumber} deleted.`);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
