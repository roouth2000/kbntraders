import { useState } from 'react';
import { Search, Bell, Share2, Download, Menu, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onExportData: () => void;
  onOpenNewInvoice: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export function TopHeader({
  onOpenMobileMenu,
  onExportData,
  onOpenNewInvoice,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}: TopHeaderProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#f4f7f8]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 border-b border-slate-200/50">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Menu, Desktop Collapse Toggle & Search Input */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Mobile hamburger menu */}
          <button
            onClick={onOpenMobileMenu}
            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white rounded-xl border border-slate-200 lg:hidden shadow-xs cursor-pointer shrink-0 active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          {/* Desktop Sidebar Collapse Toggle Button */}
          {onToggleSidebarCollapse && (
            <button
              onClick={onToggleSidebarCollapse}
              title={isSidebarCollapsed ? 'Open / Expand sidebar' : 'Close / Collapse sidebar'}
              className="hidden lg:flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs cursor-pointer shrink-0 transition-colors"
              aria-label="Toggle sidebar collapse"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4.5 h-4.5 text-teal-700" />
              ) : (
                <ChevronLeft className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>
          )}

          {/* Finova Search Bar */}
          <div className="relative w-full max-w-xs sm:max-w-md">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-xl pl-8 sm:pl-9.5 pr-3 sm:pr-14 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 shadow-xs transition-all"
            />
            <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center">
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                ⌘ + F
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification bell */}
          <button
            onClick={() => {
              setNotificationCount(0);
            }}
            className="p-2 sm:p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white rounded-xl border border-slate-200 shadow-xs cursor-pointer relative hover:border-slate-300 active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Share Link */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="hidden sm:flex text-xs font-semibold py-2 bg-white border border-slate-200 min-h-[38px] active:scale-95"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Share</span>
              </>
            )}
          </Button>

          {/* Export Data */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportData}
            className="hidden sm:flex text-xs font-semibold py-2 bg-white border border-slate-200 min-h-[38px] active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Data</span>
          </Button>

          {/* Primary Create Invoice Header CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewInvoice}
            className="text-xs font-semibold py-2 px-3 bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-xs min-h-[38px] active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Create Invoice</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
