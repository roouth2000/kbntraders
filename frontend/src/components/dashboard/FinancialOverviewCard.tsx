import { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface OverviewProps {
  onNavigateToIncome?: () => void;
  onNavigateToExpense?: () => void;
}

interface MonthlyBar {
  month: string;
  value: number;
  label: string;
  isTop?: boolean;
}

export function FinancialOverviewCard({ onNavigateToIncome, onNavigateToExpense }: OverviewProps) {
  const [timeframe, setTimeframe] = useState<'Monthly' | 'Weekly' | 'Quarterly'>('Monthly');
  const [, setHoveredBar] = useState<MonthlyBar | null>(null);

  const monthlyBars: MonthlyBar[] = [
    { month: 'Jan', value: 54, label: '54$' },
    { month: 'Feb', value: 47, label: '47$' },
    { month: 'Mar', value: 50, label: '50$' },
    { month: 'Apr', value: 58, label: '56$', isTop: true }, // highlighted April in Finova mockup
    { month: 'May', value: 56, label: '56$' },
    { month: 'Jun', value: 50, label: '50$' },
    { month: 'Jul', value: 53, label: '53$' },
    { month: 'Aug', value: 48, label: '48$' },
  ];

  const yTicks = [60, 55, 50, 45, 40];

  return (
    <Card className="p-4 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Total Balance Tab Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl">
              <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-xs bg-teal-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Total Balance ($)</span>
            </div>

            {/* Timeframe selector */}
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="appearance-none bg-white border border-slate-200/80 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 pr-6 sm:pr-7 text-[11px] sm:text-xs font-medium text-slate-600 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right Header: Stat + View Detail */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="text-left sm:text-right">
              <div className="flex items-center sm:justify-end gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">$30,000</span>
                <Badge variant="teal" size="sm" className="bg-teal-50 text-teal-700 border-teal-200/80 font-semibold text-[10px] sm:text-xs">
                  +5% this month
                </Badge>
              </div>
            </div>

            <button
              onClick={onNavigateToIncome}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
            >
              <span>View Detail</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bar Chart Area */}
        <div className="relative h-48 sm:h-56 pt-6 pb-2 w-full overflow-hidden">
          {/* Y Axis Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-slate-400 text-[10px] sm:text-[11px]">
            {yTicks.map((tick) => (
              <div key={tick} className="flex items-center w-full">
                <span className="w-5 sm:w-6 text-right pr-1 sm:pr-2 text-slate-400 font-mono text-[9px] sm:text-[10px]">{tick}</span>
                <div className="flex-1 border-b border-dashed border-slate-100" />
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-full pl-6 sm:pl-8 pr-1 sm:pr-2 flex items-end justify-between gap-1 sm:gap-3 z-10">
            {monthlyBars.map((bar) => {
              const percentage = Math.max(10, Math.min(100, ((bar.value - 38) / 24) * 100));
              const isHighlight = bar.isTop;

              return (
                <div
                  key={bar.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(bar)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Floating tooltip above top bar */}
                  {isHighlight && (
                    <div className="absolute top-0 transform -translate-x-0 z-20">
                      <div className="bg-white border border-slate-200 rounded-lg shadow-md px-2 py-0.5 sm:px-2.5 sm:py-1 text-center whitespace-nowrap">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-tight">Apr 2024</p>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          Top: $58.00
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-white border-r border-b border-slate-200 transform rotate-45 mx-auto -mt-1" />
                    </div>
                  )}

                  {/* Top value badge above bar */}
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium mb-1 group-hover:text-slate-800 transition-colors">
                    {bar.label}
                  </span>

                  {/* The Bar */}
                  <div className="w-full max-w-[18px] xs:max-w-[24px] sm:max-w-[32px] flex flex-col justify-end">
                    <div
                      style={{ height: `${percentage}%` }}
                      className={`w-full rounded-t-md sm:rounded-t-lg transition-all duration-300 ${
                        isHighlight
                          ? 'bg-[#14b8a6] shadow-[0_4px_12px_rgba(20,184,166,0.35)]'
                          : 'bg-[#bfe9e6] hover:bg-[#9fe0db]'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium mt-1.5 group-hover:text-slate-700 transition-colors">
                    {bar.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom 2 Mini Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-5 pt-4 sm:pt-5 border-t border-slate-100">
        {/* Card 1: Total Income */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="text-emerald-500 text-sm">↓</span>
              <span>Total Income</span>
            </div>
            <Badge variant="success" size="sm" className="text-[10px]">
              +5% vs last month
            </Badge>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">$12,500</p>
              <button
                onClick={onNavigateToIncome}
                className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-600 font-medium transition-colors cursor-pointer"
              >
                <span>View Report</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Sparkline Income Wave */}
            <svg className="w-20 sm:w-24 h-9 sm:h-10 text-emerald-500 overflow-visible shrink-0" viewBox="0 0 100 40">
              <path
                d="M 0 30 Q 25 35 40 20 T 70 25 T 100 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 30 Q 25 35 40 20 T 70 25 T 100 10 L 100 40 L 0 40 Z"
                fill="url(#incomeGradient)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Card 2: Total Expense */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="text-teal-600 text-sm">↑</span>
              <span>Total Expense</span>
            </div>
            <Badge variant="teal" size="sm" className="text-[10px] bg-teal-50 text-teal-700">
              +2% vs last month
            </Badge>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">$9,230</p>
              <button
                onClick={onNavigateToExpense}
                className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-600 font-medium transition-colors cursor-pointer"
              >
                <span>View Report</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Sparkline Expense Wave */}
            <svg className="w-20 sm:w-24 h-9 sm:h-10 text-teal-500 overflow-visible shrink-0" viewBox="0 0 100 40">
              <path
                d="M 0 25 Q 20 15 45 30 T 75 18 T 100 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 25 Q 20 15 45 30 T 75 18 T 100 12 L 100 40 L 0 40 Z"
                fill="url(#expenseGradient)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}
