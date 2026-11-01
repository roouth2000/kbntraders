import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  BarChart3,
  Download,
  CreditCard,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

interface LandingPageProps {
  onGoToDashboard: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export function LandingPage({
  onGoToDashboard,
  onGoToLogin,
  onGoToRegister,
}: LandingPageProps) {
  // Interactive Simulator State
  const [monthlySales, setMonthlySales] = useState(30000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(18500);

  const netProfit = monthlySales - monthlyExpenses;
  const taxEst = (Math.max(0, netProfit) * 0.15);
  const marginPct = monthlySales > 0 ? ((netProfit / monthlySales) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-800">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-[#f4f7f8]/90 backdrop-blur-md border-b border-slate-200/60 px-3 sm:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={onGoToDashboard}>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="w-3.5 h-6 bg-teal-500 rounded-full rotate-[-15deg] transform -translate-x-0.5"></div>
              <div className="w-3.5 h-6 bg-teal-300 rounded-full rotate-[-15deg] transform translate-x-0.5 opacity-90"></div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Finova</span>
              <span className="block text-[8px] sm:text-[9px] text-teal-600 font-bold tracking-widest uppercase -mt-1">
                KBN Traders
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">
              Features
            </a>
            <a href="#ledgers" className="hover:text-teal-700 transition-colors">
              Ledger Engine
            </a>
            <a href="#simulator" className="hover:text-teal-700 transition-colors">
              Profit Simulator
            </a>
            <a href="#pricing" className="hover:text-teal-700 transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onGoToLogin}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={onGoToDashboard}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-xs font-bold shadow-sm py-2 px-3 min-h-[38px] active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-20 px-3 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold mb-4 sm:mb-6 max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate">Finova Real-Time Financial Intelligence OS</span>
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.2] sm:leading-[1.15]">
          Automate Sales & Purchase Ledgers with Instant{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
            PDF Invoicing
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto mt-4 sm:mt-6 leading-relaxed">
          The all-in-one financial operating system for KBN Traders. Track accounts receivable,
          vendor payables, double-entry general ledgers, and download compliant invoices instantly.
        </p>

        <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-md mx-auto">
          <Button
            size="lg"
            variant="primary"
            onClick={onGoToDashboard}
            className="w-full xs:w-auto bg-[#0d9488] hover:bg-[#0f766e] text-sm font-bold px-6 sm:px-7 py-3 rounded-2xl shadow-lg shadow-teal-500/20 min-h-[44px] active:scale-[0.98] justify-center"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={onGoToLogin}
            className="w-full xs:w-auto text-sm font-bold px-6 sm:px-7 py-3 rounded-2xl bg-white min-h-[44px] active:scale-[0.98] justify-center"
          >
            <span>1-Click Demo Login</span>
          </Button>
        </div>

        {/* Live UI Preview Snapshot (Directly visualizes the Finova reference layout) */}
        <div className="mt-14 max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>

          <div
            onClick={onGoToDashboard}
            className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 cursor-pointer overflow-hidden text-left"
          >
            {/* Top Bar of the Mockup */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400 font-mono pl-2">Finova v2.5 • Dashboard</span>
              </div>
              <Badge variant="teal" size="sm">
                Live Interactive Mode
              </Badge>
            </div>

            {/* Quick Teaser Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              {/* Financial Overview Teaser */}
              <div className="md:col-span-8 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Balance ($)</p>
                    <p className="text-2xl font-bold text-slate-900">$30,000</p>
                  </div>
                  <Badge variant="teal">+5% this month</Badge>
                </div>

                {/* Miniature Bar Chart */}
                <div className="h-28 flex items-end justify-between gap-3 pt-4 border-b border-dashed border-slate-200 pb-2">
                  {[
                    { m: 'Jan', v: '60%' },
                    { m: 'Feb', v: '45%' },
                    { m: 'Mar', v: '55%' },
                    { m: 'Apr', v: '85%', top: true },
                    { m: 'May', v: '75%' },
                    { m: 'Jun', v: '55%' },
                    { m: 'Jul', v: '65%' },
                    { m: 'Aug', v: '50%' },
                  ].map((bar) => (
                    <div key={bar.m} className="flex-1 flex flex-col items-center h-full justify-end">
                      <div
                        style={{ height: bar.v }}
                        className={`w-full max-w-[20px] rounded-t-sm ${
                          bar.top ? 'bg-[#14b8a6]' : 'bg-[#bfe9e6]'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 mt-1">{bar.m}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-emerald-600 font-semibold">↓ Total Income: $12,500</span>
                  <span className="text-teal-700 font-semibold">↑ Total Expense: $9,230</span>
                </div>
              </div>

              {/* Financial Report Teaser */}
              <div className="md:col-span-4 p-5 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase mb-3">Financial Report</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Income</span>
                      <span className="font-bold text-slate-800">$30,000 (+5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Expenses</span>
                      <span className="font-bold text-slate-800">$18,500 (-2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Net Profit</span>
                      <span className="font-bold text-emerald-600">$11,500 (+8%)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-teal-600 font-semibold">
                  <span>Open Full Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/70 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="teal" size="sm" className="mb-2">
              Enterprise Grade
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Modern High-Velocity Commerce
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Eliminate manual bookkeeping, late customer payments, and disjointed procurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-slate-50/50 hover:bg-white transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Automated Sales Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Issue tax invoices in seconds, track receivable aging, automate payment reminders,
                and reconcile client statements with one click.
              </p>
            </Card>

            <Card className="p-6 bg-slate-50/50 hover:bg-white transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Instant PDF Invoice Download</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate professional PDF invoices and purchase vouchers directly in browser using
                jsPDF. Includes GSTIN, itemized rates, discounts, and print controls.
              </p>
            </Card>

            <Card className="p-6 bg-slate-50/50 hover:bg-white transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Double-Entry General Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time chart of accounts, debit/credit journal vouchers, automated trial balances,
                and instant CSV statement export for compliance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="simulator" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="teal" size="sm">
              Interactive ROI Tool
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Test Real-Time Net Profit & Tax Estimation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Drag the sliders to see how Finova computes net profit margins, tax provisions, and
              retained treasury reserves in real time.
            </p>

            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Monthly Sales (Income)</span>
                  <span className="font-mono text-teal-700">{formatCurrency(monthlySales)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={monthlySales}
                  onChange={(e) => setMonthlySales(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Monthly Expenses (Purchases)</span>
                  <span className="font-mono text-rose-600">{formatCurrency(monthlyExpenses)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="80000"
                  step="500"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="bg-white p-6 sm:p-8 border border-slate-200">
              <h3 className="text-base font-bold text-slate-800 mb-6">
                Live Pro-Forma Ledger Results
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Net Operating Profit</p>
                  <p className={`text-xl font-bold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Margin: {marginPct}%</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Estimated Tax Reserve</p>
                  <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                    {formatCurrency(taxEst)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Provision 15%</span>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100">
                  <p className="text-[11px] font-semibold text-teal-700 uppercase">Retained Liquidity</p>
                  <p className="text-xl font-bold font-mono text-teal-900 mt-1">
                    {formatCurrency(Math.max(0, netProfit - taxEst))}
                  </p>
                  <span className="text-[10px] text-teal-700 font-medium">Bank-ready cash</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={onGoToDashboard}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] py-3 text-xs font-bold"
              >
                Implement This Model in Your Finova Workspace
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200/70 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <Badge variant="teal" size="sm" className="mb-2">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Predictable Plans for Growing Traders
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Includes unlimited PDF downloads, sales ledgers, and bank reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <Card className="p-6 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-base">Starter Trader</h4>
                <p className="text-xs text-slate-500 mt-1">For single-entity boutiques</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-900">$29</span>
                  <span className="text-xs text-slate-500 font-medium"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Up to 100 sales invoices/mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>PDF invoice generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Standard general ledger</span>
                  </li>
                </ul>
              </div>

              <Button variant="secondary" onClick={onGoToDashboard} className="w-full mt-6 text-xs">
                Get Started
              </Button>
            </Card>

            {/* Pro Business (Highlighted) */}
            <Card className="p-6 bg-slate-900 text-white border-slate-800 relative flex flex-col justify-between shadow-xl">
              <div className="absolute -top-3 right-6">
                <Badge variant="teal" size="sm" className="bg-teal-500 text-white border-0 font-bold">
                  Most Popular
                </Badge>
              </div>

              <div>
                <h4 className="font-bold text-white text-base">Pro Trader Enterprise</h4>
                <p className="text-xs text-slate-400 mt-1">For growing distributors & agencies</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-white">$79</span>
                  <span className="text-xs text-slate-400 font-medium"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Unlimited sales & purchase ledgers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Instant high-resolution PDF invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>AI financial intelligence module</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Corporate cards & limit controls</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="primary"
                onClick={onGoToDashboard}
                className="w-full mt-6 bg-[#14b8a6] hover:bg-[#0d9488] text-xs font-bold"
              >
                Launch Pro Workspace
              </Button>
            </Card>

            {/* Enterprise */}
            <Card className="p-6 bg-white border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-base">Custom Corporate</h4>
                <p className="text-xs text-slate-500 mt-1">Multi-branch global conglomerates</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-900">$199</span>
                  <span className="text-xs text-slate-500 font-medium"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Dedicated database clusters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Custom ERP & bank API sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>24/7 dedicated ledger auditing team</span>
                  </li>
                </ul>
              </div>

              <Button variant="secondary" onClick={onGoToDashboard} className="w-full mt-6 text-xs">
                Contact Sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="w-3 h-5 bg-teal-500 rounded-full rotate-[-15deg]"></div>
              <div className="w-3 h-5 bg-teal-300 rounded-full rotate-[-15deg] opacity-90"></div>
            </div>
            <span className="font-bold text-white text-base">Finova • KBN Traders</span>
          </div>

          <p className="text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} KBN Traders & Finova Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
