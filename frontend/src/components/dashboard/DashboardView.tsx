import { useState } from 'react';
import {
  Calendar,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Scale,
  Box,
  Share2,
  Printer,
  ChevronRight,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Invoice, PaymentRecord, NavTab } from '../../types';
import { formatCurrency, formatDate, buildWhatsAppBillMessage } from '../../utils/formatters';

interface DashboardViewProps {
  dailySales: number;
  yesterdaySales: number;
  totalSales: number;
  dailyCollections: number;
  totalCollections: number;
  collectionsByMode: { cash: number; upi: number; bank: number };
  totalCustomerDues: number;
  totalCustomerAdvances: number;
  varietySales: { code: string; name: string; totalKg: number; totalBoxes: number; revenue: number }[];
  recentInvoices: Invoice[];
  recentPayments: PaymentRecord[];
  onOpenNewInvoice: () => void;
  onOpenRecordPayment: () => void;
  onOpenCustomerModal?: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onNavigate: (tab: NavTab) => void;
}

export function DashboardView({
  dailySales,
  yesterdaySales,
  totalSales,
  dailyCollections,
  totalCollections,
  collectionsByMode,
  totalCustomerDues,
  totalCustomerAdvances,
  varietySales,
  recentInvoices,
  recentPayments,
  onOpenNewInvoice,
  onOpenRecordPayment,
  onOpenCustomerModal,
  onViewInvoice,
  onNavigate,
}: DashboardViewProps) {
  const [dateRange, setDateRange] = useState('Today (21 Oct 2026)');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Sales change vs yesterday
  const salesDiff = dailySales - yesterdaySales;
  const isSalesPositive = salesDiff >= 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              KBN Traders Mandi Dashboard
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Live APMC Market
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time daily sales, collections, multi-variety billing, and customer dues overview.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenRecordPayment}
            className="bg-white border border-slate-200 text-xs font-semibold py-2"
          >
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
            <span>Record Payment</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewInvoice}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-xs font-semibold py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Multi-Variety Bill</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Row: Daily Sales, Daily Collections, Total Customer Dues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Sales */}
        <Card className="p-4 bg-white border border-slate-200/90 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Daily Sales (Today)</span>
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(dailySales)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className={`flex items-center font-bold ${isSalesPositive ? 'text-teal-600' : 'text-slate-500'}`}>
              {isSalesPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
              {yesterdaySales > 0 ? `${Math.abs(Math.round((salesDiff / yesterdaySales) * 100))}%` : 'Fresh'}
            </span>
            <span className="text-slate-400 text-[11px]">vs yesterday ({formatCurrency(yesterdaySales)})</span>
          </div>
        </Card>

        {/* 2. Daily Collections */}
        <Card className="p-4 bg-white border border-slate-200/90 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Daily Collections</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">{formatCurrency(dailyCollections)}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-slate-500">
            <span className="px-1.5 py-0.5 bg-slate-100 rounded">UPI: {formatCurrency(collectionsByMode.upi)}</span>
            <span className="px-1.5 py-0.5 bg-slate-100 rounded">Cash: {formatCurrency(collectionsByMode.cash)}</span>
          </div>
        </Card>

        {/* 3. Total Customer Dues (Receivables) */}
        <Card className="p-4 bg-white border border-slate-200/90 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('customer-ledger')}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Customer Dues</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono">{formatCurrency(totalCustomerDues)}</p>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Outstanding receivables</span>
            <span className="text-teal-600 font-semibold hover:underline">View Ledger &rarr;</span>
          </p>
        </Card>

        {/* 4. Total Collections & Advances */}
        <Card className="p-4 bg-white border border-slate-200/90 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Mandi Revenue</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(totalSales)}</p>
          <p className="text-[11px] text-slate-400 mt-2">
            Advance deposits: <span className="font-bold text-emerald-600">{formatCurrency(totalCustomerAdvances)}</span>
          </p>
        </Card>
      </div>

      {/* Multi-Variety Billing Summary Bar: A1, A2, A3, SPL, Loosu, Custom */}
      <Card className="p-5 bg-white border border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600" />
              Multi-Variety Sales Overview (A1, A2, A3, SPL, Loosu & Custom Grades)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of produce sold in Boxes and Kilograms with separate rates.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('reports')}
            className="text-xs text-teal-700 hover:bg-teal-50 py-1"
          >
            Detailed Variety Report &rarr;
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
          {varietySales.map((v) => (
            <div
              key={v.code}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-600 text-white font-mono">
                  {v.code}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-800">
                  {formatCurrency(v.revenue)}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2 truncate">{v.name}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                <span>{v.totalBoxes} Boxes</span>
                <span>•</span>
                <span>{v.totalKg} Kg</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Split Grid: Recent Invoices (7 cols) + Today's Collections & Payment Modes (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Multi-Variety Bills */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Mandi Bills & Multi-Variety Invoices</h3>
                <p className="text-xs text-slate-500">Live sales transactions with instant WhatsApp and print shortcuts.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('invoices')}
                className="text-xs text-teal-700 hover:bg-teal-50 font-semibold"
              >
                View All Bills &rarr;
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-slate-100/70 text-slate-600 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">Bill #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 text-right">Due (₹)</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recentInvoices.slice(0, 5).map((inv) => {
                    const total = Number(inv.total || 0);
                    const paid = Number(inv.paidAmount || 0);
                    const due = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, total - paid));

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 font-bold font-mono text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{formatDate(inv.date)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{inv.partyName}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(total)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          {due > 0 ? formatCurrency(due) : <span className="text-emerald-600 font-normal">Paid</span>}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            variant={inv.status === 'Paid' ? 'success' : inv.status === 'Partial' ? 'teal' : 'warning'}
                            size="sm"
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewInvoice(inv)}
                            className="text-xs text-teal-700 hover:bg-teal-50 py-1 px-2 font-semibold"
                          >
                            View & Share
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Collections Breakdown & Recent Payments */}
        <div className="lg:col-span-4 space-y-4">
          {/* Payment Modes Card */}
          <Card className="p-4 bg-white border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Collection Modes</span>
              <CreditCard className="w-4 h-4 text-teal-600" />
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  UPI (GPay / PhonePe)
                </span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(collectionsByMode.upi)}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Cash Receipts
                </span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(collectionsByMode.cash)}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Bank Transfer (NEFT/IMPS)
                </span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(collectionsByMode.bank)}</span>
              </div>
            </div>
          </Card>

          {/* Recent Collections List */}
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Collections</h3>
              <span className="text-[10px] text-teal-600 font-bold font-mono">Live Sync</span>
            </div>

            <div className="space-y-2 text-xs">
              {recentPayments.slice(0, 4).map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{p.customer_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {p.payment_mode} • {formatDate(p.payment_date)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">+{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
