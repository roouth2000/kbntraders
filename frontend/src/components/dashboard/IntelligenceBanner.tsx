import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function IntelligenceBanner() {
  const [activated, setActivated] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4ea5a5] to-[#257d7d] p-5 text-white shadow-[0_4px_20px_rgba(37,125,125,0.2)]">
      {/* Decorative Wave SVGs in Background */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
          <circle cx="150" cy="100" r="80" stroke="white" strokeWidth="2" />
          <circle cx="150" cy="100" r="120" stroke="white" strokeWidth="2" />
          <path d="M 50 150 Q 120 50 200 120" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[85%]">
        <h4 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-white mb-3">
          Stay Ahead with Real-Time Financial Intelligence
        </h4>
        <p className="text-xs text-teal-100/90 mb-4 leading-relaxed hidden sm:block">
          Predict cash bottlenecks, automate ledger matching, and optimize tax deductions instantly.
        </p>

        <Button
          size="sm"
          onClick={() => setActivated(!activated)}
          className="bg-white text-teal-800 hover:bg-teal-50 border-0 font-bold px-4 py-1.5 shadow-sm rounded-lg"
        >
          {activated ? (
            <span className="flex items-center gap-1.5 text-xs text-teal-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Active AI Protection
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs">
              Activate
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
