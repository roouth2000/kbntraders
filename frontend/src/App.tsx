import { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NavTab, Invoice } from './types';
import { useLedgerStore } from './hooks/useLedgerStore';
import { useAuth } from './context/AuthContext';

// Route Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { SalesLedgerView } from './components/ledgers/SalesLedgerView';
import { CustomerLedgerMasterView } from './components/ledgers/CustomerLedgerMasterView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { ApiDocsView } from './components/views/ApiDocsView';

// Auth & Public Pages
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';

// KBN Traders Modals
import { ProduceInvoiceBuilderModal } from './components/billing/ProduceInvoiceBuilderModal';
import { PaymentModal } from './components/billing/PaymentModal';
import { PrintableInvoiceModal } from './components/billing/PrintableInvoiceModal';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('kbn_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('kbn_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Modal States
  const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPreselectedCustomerId, setPaymentPreselectedCustomerId] = useState<string | undefined>(undefined);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const {
    customers,
    varieties,
    invoices,
    payments,
    customerLedger,
    dailySales,
    yesterdaySales,
    totalSales,
    dailyCollections,
    totalCollections,
    collectionsByMode,
    totalCustomerDues,
    totalCustomerAdvances,
    varietySales,
    addCustomer,
    updateCustomer,
    addVariety,
    updateVariety,
    deleteVariety,
    addProduceInvoice,
    addPayment,
    getCustomerLedgerStatement,
    updateInvoiceStatus,
    deleteInvoice,
    resetToDefaults,
  } = useLedgerStore();

  const handleOpenProduceBill = () => {
    setIsProduceModalOpen(true);
  };

  const handleOpenRecordPayment = (customerId?: string) => {
    setPaymentPreselectedCustomerId(customerId);
    setIsPaymentModalOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
  };

  // Derive currentTab from URL pathname (e.g. "/customer-ledger" -> "customer-ledger")
  const currentTab: NavTab = useMemo(() => {
    const rawPath = location.pathname.replace(/^\/+/, '');
    if (!rawPath || rawPath === 'landing') return 'dashboard';
    return rawPath as NavTab;
  }, [location.pathname]);

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'landing') navigate('/');
    else navigate(`/${tab}`);
  };

  return (
    <>
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '16px',
            fontSize: '13px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #f1f5f9',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#0d9488',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage
                onGoToDashboard={() => navigate('/dashboard')}
                onGoToLogin={() => navigate('/login')}
                onGoToRegister={() => navigate('/register')}
              />
            </PublicOnlyRoute>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Dashboard & Ledger Workspace */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-[#f4f7f8] text-slate-800 flex">
                {/* Finova Sidebar */}
                <Sidebar
                  currentTab={currentTab}
                  onSelectTab={handleSelectTab}
                  isOpenMobile={isMobileSidebarOpen}
                  onCloseMobile={() => setIsMobileSidebarOpen(false)}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={handleToggleSidebarCollapse}
                  user={user}
                  onLogout={async () => {
                    await logout();
                    navigate('/login');
                  }}
                />

                {/* Main Content Area */}
                <div
                  className={`flex-1 ${
                    isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                  } flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
                >
                  {/* Top Header */}
                  <TopHeader
                    onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
                    onExportData={() => {}}
                    onOpenNewInvoice={handleOpenProduceBill}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebarCollapse={handleToggleSidebarCollapse}
                  />

                  {/* Main Container */}
                  <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
                    <Routes>
                      {/* 1. Dashboard */}
                      <Route
                        path="dashboard"
                        element={
                          <DashboardView
                            dailySales={dailySales}
                            yesterdaySales={yesterdaySales}
                            totalSales={totalSales}
                            dailyCollections={dailyCollections}
                            totalCollections={totalCollections}
                            collectionsByMode={collectionsByMode}
                            totalCustomerDues={totalCustomerDues}
                            totalCustomerAdvances={totalCustomerAdvances}
                            varietySales={varietySales}
                            recentInvoices={invoices}
                            recentPayments={payments}
                            onOpenNewInvoice={handleOpenProduceBill}
                            onOpenRecordPayment={() => handleOpenRecordPayment()}
                            onViewInvoice={handleViewInvoice}
                            onNavigate={handleSelectTab}
                          />
                        }
                      />

                      {/* 2. Invoices & Multi-Variety Sales Billing */}
                      <Route
                        path="invoices"
                        element={
                          <SalesLedgerView
                            invoices={invoices}
                            customers={customers}
                            onOpenCreateInvoice={handleOpenProduceBill}
                            onViewInvoice={handleViewInvoice}
                            onUpdateStatus={updateInvoiceStatus}
                            onDeleteInvoice={deleteInvoice}
                            searchQuery={searchQuery}
                          />
                        }
                      />
                      <Route
                        path="sales-ledger"
                        element={
                          <SalesLedgerView
                            invoices={invoices}
                            customers={customers}
                            onOpenCreateInvoice={handleOpenProduceBill}
                            onViewInvoice={handleViewInvoice}
                            onUpdateStatus={updateInvoiceStatus}
                            onDeleteInvoice={deleteInvoice}
                            searchQuery={searchQuery}
                          />
                        }
                      />

                      {/* 3. Customer Management & Running Ledgers */}
                      <Route
                        path="customer-ledger"
                        element={
                          <CustomerLedgerMasterView
                            customers={customers}
                            invoices={invoices}
                            payments={payments}
                            varieties={varieties}
                            onAddCustomer={addCustomer}
                            onUpdateCustomer={updateCustomer}
                            onOpenNewInvoice={handleOpenProduceBill}
                            onOpenRecordPayment={handleOpenRecordPayment}
                            getCustomerLedgerStatement={getCustomerLedgerStatement}
                          />
                        }
                      />
                      <Route
                        path="customer-ledger/:customerId"
                        element={
                          <CustomerLedgerMasterView
                            customers={customers}
                            invoices={invoices}
                            payments={payments}
                            varieties={varieties}
                            onAddCustomer={addCustomer}
                            onUpdateCustomer={updateCustomer}
                            onOpenNewInvoice={handleOpenProduceBill}
                            onOpenRecordPayment={handleOpenRecordPayment}
                            getCustomerLedgerStatement={getCustomerLedgerStatement}
                          />
                        }
                      />

                      {/* 4. Variety Directory & Reports */}
                      <Route
                        path="reports"
                        element={
                          <ReportsView
                            invoices={invoices}
                            payments={payments}
                            customers={customers}
                            varieties={varieties}
                            onAddVariety={addVariety}
                            onUpdateVariety={updateVariety}
                            onDeleteVariety={deleteVariety}
                          />
                        }
                      />

                      {/* 5. System Settings */}
                      <Route
                        path="settings"
                        element={
                          <SettingsView
                            user={user}
                            onResetData={resetToDefaults}
                          />
                        }
                      />

                      {/* 6. Swagger API Documentation */}
                      <Route path="api-docs" element={<ApiDocsView />} />

                      {/* Default inside protected app */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>

                  {/* Mobile Bottom Navigation Bar */}
                  <MobileNav
                    currentTab={currentTab}
                    onSelectTab={handleSelectTab}
                    onOpenNewInvoice={handleOpenProduceBill}
                  />
                </div>

                {/* Multi-Variety Produce Invoice Builder Modal */}
                <ProduceInvoiceBuilderModal
                  isOpen={isProduceModalOpen}
                  onClose={() => setIsProduceModalOpen(false)}
                  onSaveInvoice={addProduceInvoice}
                  customers={customers}
                  varieties={varieties}
                  onAddCustomer={addCustomer}
                  onAddVariety={addVariety}
                />

                {/* Record Payment (Cash, UPI, Bank Transfer) Modal */}
                <PaymentModal
                  isOpen={isPaymentModalOpen}
                  onClose={() => setIsPaymentModalOpen(false)}
                  onRecordPayment={addPayment}
                  customers={customers}
                  invoices={invoices}
                  initialCustomerId={paymentPreselectedCustomerId}
                />

                {/* Printable Invoice & WhatsApp Bill Modal */}
                <PrintableInvoiceModal
                  isOpen={!!viewingInvoice}
                  onClose={() => setViewingInvoice(null)}
                  invoice={viewingInvoice}
                  previousDue={
                    viewingInvoice
                      ? Number(
                          customers.find((c) => c.name === viewingInvoice.partyName)?.current_balance || 0
                        ) - Number(viewingInvoice.balanceDue || 0)
                      : 0
                  }
                />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
