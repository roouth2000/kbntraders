import { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';

interface TransactionHistoryProps {
  onViewDetail?: () => void;
}

export function TransactionHistoryCard({ onViewDetail }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'Monthly' | 'Weekly' | 'Yearly'>('Monthly');

  // Donut chart stroke segments
  // Circumference of r=36 is 2 * PI * 36 ≈ 226.19
  // Transfer: 50% => dasharray: 113.1, gap: 113.1, offset: 0
  // Online Payment: 30% => dasharray: 67.8, gap: 158.4, offset: -113.1
  // Subscription: 20% => dasharray: 45.2, gap: 181.0, offset: -180.9
  const circumference = 2 * Math.PI * 36;
  const transferLength = circumference * 0.50;
  const onlineLength = circumference * 0.30;
  const subLength = circumference * 0.20;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <CardHeader className="mb-4">
          <CardTitle>Transaction History</CardTitle>
          <button
            onClick={onViewDetail}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
          >
            <span>View Detail</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </CardHeader>

        {/* Filter bar & Spent label */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 pr-6 text-xs font-medium text-slate-600 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-[11px] font-medium text-slate-400">
            Spent <strong className="text-slate-700 font-semibold">$18.00</strong>
          </span>
        </div>

        {/* Donut Chart & Legend Side-by-Side */}
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#134e4a]" />
              <span className="text-xs text-slate-600 font-medium">Transfer (50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
              <span className="text-xs text-slate-600 font-medium">Online Payment (30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#99f6e4]" />
              <span className="text-xs text-slate-600 font-medium">Subscription (20%)</span>
            </div>
          </div>

          {/* Donut SVG */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
              />
              {/* Transfer Segment (50%) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="#134e4a"
                strokeWidth="10"
                strokeDasharray={`${transferLength} ${circumference}`}
                strokeDashoffset="0"
                className="transition-all duration-500"
              />
              {/* Online Payment Segment (30%) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="10"
                strokeDasharray={`${onlineLength} ${circumference}`}
                strokeDashoffset={`-${transferLength}`}
                className="transition-all duration-500"
              />
              {/* Subscription Segment (20%) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="#99f6e4"
                strokeWidth="10"
                strokeDasharray={`${subLength} ${circumference}`}
                strokeDashoffset={`-${transferLength + onlineLength}`}
                className="transition-all duration-500"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-slate-900 leading-tight">$30,00</span>
              <span className="text-[9px] text-slate-400 font-medium leading-none">Total Spent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Payment Channels</span>
        <span className="text-teal-600 font-medium">3 Active Gateways</span>
      </div>
    </Card>
  );
}
