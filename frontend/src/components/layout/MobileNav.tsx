import { useState } from 'react';
import {
  LayoutGrid,
  Receipt,
  Building2,
  FileText,
  Settings,
  Plus,
  Grid,
  X,
} from 'lucide-react';
import { NavTab } from '../../types';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewInvoice?: () => void;
}

export function MobileNav({ currentTab, onSelectTab, onOpenNewInvoice }: MobileNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'invoices' as NavTab, label: 'Invoices', icon: Receipt },
    { id: 'customer-ledger' as NavTab, label: 'Ledgers', icon: Building2 },
    { id: 'reports' as NavTab, label: 'Variety', icon: FileText },
  ];

  const allMoreModules = [
    { id: 'api-docs' as NavTab, label: 'Sequelize API Docs', desc: 'Interactive API explorer', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', desc: 'Preferences & taxes', icon: Settings },
  ];

  const handleSelectMoreTab = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMoreOpen(false);
  };

  const isMoreActive = allMoreModules.some((m) => m.id === currentTab);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id || (tab.id === 'invoices' && currentTab === 'sales-ledger');
          const buttonClass = `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-16 active:scale-95 ${
            isActive ? 'text-[#3498ac] font-bold' : 'text-slate-400 hover:text-slate-700'
          }`;
          const iconContainerClass = `relative p-1.5 rounded-xl transition-all ${
            isActive ? 'bg-[#eaf6f9] text-[#3498ac] scale-105' : ''
          }`;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={buttonClass}
            >
              <div className={iconContainerClass}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#3498ac] rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu Tab */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-16 active:scale-95 ${
            isMoreActive || isMoreOpen ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <div
            className={`relative p-1.5 rounded-xl transition-all ${
              isMoreActive || isMoreOpen ? 'bg-teal-50 text-teal-600 scale-105' : ''
            }`}
          >
            <Grid className="w-5 h-5" />
            {(isMoreActive || isMoreOpen) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </nav>

      {/* Mobile "More" Full Screen / Bottom Sheet Modal */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Finova All Modules</h3>
                <p className="text-xs text-slate-400">Quick access to all trading & ledger screens</p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action: Create Invoice */}
            {onOpenNewInvoice && (
              <div className="p-4 border-b border-slate-100 bg-teal-50/50">
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenNewInvoice();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Invoice / Bill</span>
                </button>
              </div>
            )}

            {/* Modules Grid */}
            <div className="p-4 overflow-y-auto space-y-2">
              {allMoreModules.map((item) => {
                const Icon = item.icon;
                const isSelected = currentTab === item.id;
                const itemClass = `w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50 border border-teal-200/80 text-teal-800'
                    : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-100 text-slate-700'
                }`;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMoreTab(item.id)}
                    className={itemClass}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 shadow-xs'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Safe area padding */}
            <div className="pb-6" />
          </div>
        </div>
      )}
    </>
  );
}
