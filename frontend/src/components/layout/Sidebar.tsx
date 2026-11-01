import {
  LayoutGrid,
  Receipt,
  FileText,
  HelpCircle,
  Settings,
  X,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavTab, User as UserType } from '../../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user: UserType | null;
  onLogout: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  user,
  onLogout,
}: SidebarProps) {
  const operationsNav = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'invoices' as NavTab, label: 'Invoices', icon: Receipt },
    { id: 'customer-ledger' as NavTab, label: 'Customer Ledger & Dues', icon: Building2 },
    { id: 'reports' as NavTab, label: 'Variety', icon: FileText },
  ];

  const supportNav = [
    { id: 'api-docs' as NavTab, label: 'API & Swagger Docs', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const asideClasses = `fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#e8edf3] flex flex-col justify-between transition-all duration-300 ease-in-out ${
    isCollapsed ? 'lg:w-20' : 'lg:w-64'
  } w-64 ${
    isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
  }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={asideClasses}>
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo & Collapse / Close Buttons */}
          <div
            className={`h-16 px-4 flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } border-b border-slate-100 transition-all`}
          >
            {!isCollapsed ? (
              <div
                className="flex items-center gap-3 cursor-pointer group min-w-0"
                onClick={() => handleNavClick('dashboard')}
              >
                {/* Finova Logo Icon: Dual teal ribbons */}
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <div className="w-3.5 h-6 bg-teal-500 rounded-full rotate-[-15deg] transform translate-x-[-2px] transition-transform group-hover:scale-105"></div>
                  <div className="w-3.5 h-6 bg-teal-300 rounded-full rotate-[-15deg] transform translate-x-[2px] opacity-90 transition-transform group-hover:scale-105"></div>
                </div>
                <div className="min-w-0">
                  <span className="text-lg font-bold tracking-tight text-slate-800 block truncate">Finova</span>
                  <span className="block text-[10px] text-[#3498ac] font-semibold tracking-wider uppercase -mt-1 truncate">
                    KBN Traders
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="relative w-8 h-8 flex items-center justify-center cursor-pointer group"
                onClick={onToggleCollapse}
                title="Finova KBN Traders - Click to expand"
              >
                <div className="w-3.5 h-6 bg-teal-500 rounded-full rotate-[-15deg] transform translate-x-[-2px] transition-transform group-hover:scale-110"></div>
                <div className="w-3.5 h-6 bg-teal-300 rounded-full rotate-[-15deg] transform translate-x-[2px] opacity-90 transition-transform group-hover:scale-110"></div>
              </div>
            )}

            <div className="flex items-center gap-1">
              {/* Desktop Collapse / Expand Button */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title={isCollapsed ? 'Expand sidebar (Open)' : 'Collapse sidebar (Close)'}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Toggle collapse"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-teal-700" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3.5 py-4 space-y-6 flex-1">
            {/* OPERATIONS Section */}
            <div>
              {!isCollapsed ? (
                <p className="px-3.5 text-[11px] font-bold text-[#90a1b9] uppercase tracking-wider mb-2">
                  Operations
                </p>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              <nav className="space-y-1">
                {operationsNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || (item.id === 'invoices' && currentTab === 'sales-ledger');
                  const buttonClasses = `w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
                  } rounded-2xl text-sm transition-all text-left cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#eaf6f9] text-[#3498ac] font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f1f8fa]/60'
                  }`;
                  const iconClasses = `w-4.5 h-4.5 shrink-0 transition-colors ${
                    isActive ? 'text-[#3498ac]' : 'text-slate-400'
                  }`;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={buttonClasses}
                    >
                      <Icon className={iconClasses} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* SUPPORT Section */}
            <div>
              {!isCollapsed ? (
                <p className="px-3.5 text-[11px] font-bold text-[#90a1b9] uppercase tracking-wider mb-2">
                  Support & System
                </p>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}
              <nav className="space-y-1">
                {supportNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  const buttonClasses = `w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
                  } rounded-2xl text-sm transition-all text-left cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#eaf6f9] text-[#3498ac] font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f1f8fa]/60'
                  }`;
                  const iconClasses = `w-4.5 h-4.5 shrink-0 transition-colors ${
                    isActive ? 'text-[#3498ac]' : 'text-slate-400'
                  }`;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={buttonClasses}
                    >
                      <Icon className={iconClasses} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}

                <a
                  href="#support"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Help Center & Documentation is available 24/7 at support@kbntraders.com');
                  }}
                  title={isCollapsed ? 'Help Center' : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'
                  } rounded-2xl text-sm text-slate-600 hover:text-slate-900 hover:bg-[#f1f8fa]/60 transition-colors cursor-pointer`}
                >
                  <HelpCircle className="w-4.5 h-4.5 shrink-0 text-slate-400" />
                  {!isCollapsed && <span className="truncate">Help Center</span>}
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className={`p-3 border-t border-slate-100 bg-white ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'User'}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {user?.name || 'Vincent Rompies'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'vintwork@gmail.com'}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="relative cursor-pointer shrink-0"
                title={`${user?.name || 'User'} (${user?.email || ''})`}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
