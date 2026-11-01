export type NavTab = 
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'dashboard'
  | 'sales-ledger'
  | 'customer-ledger'
  | 'reports'
  | 'invoices'
  | 'settings'
  | 'api-docs';

export type UserRole = 'Admin' | 'User' | 'admin' | 'user' | 'Financial Manager' | 'Accountant' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: UserRole;
  avatar: string;
  currency: string;
  currencySymbol: string;
}

export type InvoiceStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue' | 'Draft';
export type InvoiceType = 'sales' | 'purchase';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer';

export interface ProduceVariety {
  id: string;
  fruit?: string; // e.g. 'Apple', 'Malta', 'Orange', or custom
  origin?: string; // e.g. 'Indian', 'Turkey', 'Poland', 'Egypt', 'Australia'
  size_count?: string; // e.g. '135', '100', '90', '200 (Small)', '250 (Extra Small)', '80', '88'
  code: string; // e.g. 'APL-IND-135', 'MLT-EGY-80', 'A1', etc.
  name: string; // e.g. 'Indian Apple 135 Count'
  default_unit: 'Kg' | 'Box';
  default_rate_kg: number;
  default_rate_box: number;
  is_custom: boolean;
  is_active: boolean;
}

export interface ProduceInvoiceItem {
  id: string;
  variety: string;
  fruit?: string;
  origin?: string;
  size_count?: string;
  unit: 'Kg' | 'Box';
  boxes: number;
  weight_kg: number;
  rate: number;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  amount: number;
  variety?: string;
  unit?: 'Kg' | 'Box';
  boxes?: number;
  weight_kg?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  dueDate: string;
  customerId?: string;
  partyName: string; // Customer name
  partyEmail: string;
  partyPhone?: string;
  partyAddress: string;
  partyTaxId?: string;
  items: (InvoiceItem | ProduceInvoiceItem)[];
  produceItems?: ProduceInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount?: number;
  balanceDue?: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  paymentMode?: PaymentMode;
  transactionRef?: string;
  notes?: string;
  terms?: string;
  whatsappText?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  opening_balance: number;
  current_balance: number;
  total_sales: number;
  total_paid: number;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  payment_number: string;
  customer_id: string;
  customer_name: string;
  invoice_id?: string;
  invoice_number?: string;
  amount: number;
  payment_mode: PaymentMode;
  transaction_ref?: string;
  payment_date: string;
  notes?: string;
}

export interface CustomerLedgerRow {
  id: string;
  customer_id: string;
  customer_name: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
  type: 'opening' | 'invoice' | 'payment' | 'adjustment';
}

