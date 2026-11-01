/**
 * System Constants for KBN Traders Suite
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  USER: 'user',
  VIEWER: 'viewer',
};

export const PERMISSIONS = {
  // Invoices & Billing
  INVOICES_READ: 'invoices:read',
  INVOICES_CREATE: 'invoices:create',
  INVOICES_EDIT: 'invoices:edit',
  INVOICES_DELETE: 'invoices:delete',
  INVOICES_EXPORT: 'invoices:export',

  // Customers & Buyers
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',

  // Payments & Collections
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_EDIT: 'payments:edit',
  PAYMENTS_DELETE: 'payments:delete',

  // Customer Ledgers & Statements
  LEDGERS_READ: 'ledgers:read',
  LEDGERS_EXPORT: 'ledgers:export',
  LEDGERS_ADJUST: 'ledgers:adjust',

  // Produce Varieties & Rates
  VARIETIES_READ: 'varieties:read',
  VARIETIES_CREATE: 'varieties:create',
  VARIETIES_EDIT: 'varieties:edit',
  VARIETIES_DELETE: 'varieties:delete',

  // Analytics & Reports
  REPORTS_DASHBOARD: 'reports:dashboard',
  REPORTS_VARIETY: 'reports:variety',
  REPORTS_FINANCIAL: 'reports:financial',

  // Administration & Security
  USERS_MANAGE: 'users:manage',
  ROLES_MANAGE: 'roles:manage',
  SETTINGS_MANAGE: 'settings:manage',
};

export const PERMISSION_MODULES = [
  {
    id: 'invoices',
    name: 'Produce Invoices & Billing',
    description: 'Manage mandi fruit bills, commissions, and multi-variety invoice generation',
    permissions: [
      { key: PERMISSIONS.INVOICES_READ, label: 'View Invoices', description: 'Browse and inspect generated produce bills' },
      { key: PERMISSIONS.INVOICES_CREATE, label: 'Create Invoices', description: 'Generate new produce bills and print receipts' },
      { key: PERMISSIONS.INVOICES_EDIT, label: 'Edit Invoices', description: 'Modify line items, quantities, or invoice status' },
      { key: PERMISSIONS.INVOICES_DELETE, label: 'Delete Invoices', description: 'Void or permanently remove billing records' },
      { key: PERMISSIONS.INVOICES_EXPORT, label: 'Export Invoices', description: 'Download billing summaries in CSV and PDF' },
    ],
  },
  {
    id: 'customers',
    name: 'Customer & Buyer Directory',
    description: 'Maintain verified buyer records, opening balances, and contact details',
    permissions: [
      { key: PERMISSIONS.CUSTOMERS_READ, label: 'View Customers', description: 'Browse buyer roster and contact details' },
      { key: PERMISSIONS.CUSTOMERS_CREATE, label: 'Register Customers', description: 'Add new wholesale buyers or merchants' },
      { key: PERMISSIONS.CUSTOMERS_EDIT, label: 'Edit Customer Details', description: 'Update phone, address, and balance notes' },
      { key: PERMISSIONS.CUSTOMERS_DELETE, label: 'Delete Customers', description: 'Remove inactive buyer records' },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Collections',
    description: 'Record Cash, UPI, and Bank settlements from buyers',
    permissions: [
      { key: PERMISSIONS.PAYMENTS_READ, label: 'View Payments', description: 'Inspect payment history and vouchers' },
      { key: PERMISSIONS.PAYMENTS_CREATE, label: 'Record Collections', description: 'Log incoming cash, UPI, and bank transfers' },
      { key: PERMISSIONS.PAYMENTS_EDIT, label: 'Edit Payments', description: 'Update payment modes, dates, or notes' },
      { key: PERMISSIONS.PAYMENTS_DELETE, label: 'Delete Payments', description: 'Void or remove payment vouchers' },
    ],
  },
  {
    id: 'ledgers',
    name: 'Customer Ledgers & Dues',
    description: 'Track real-time debit/credit running balances and financial statements',
    permissions: [
      { key: PERMISSIONS.LEDGERS_READ, label: 'View Ledgers', description: 'Review buyer account running statements' },
      { key: PERMISSIONS.LEDGERS_EXPORT, label: 'Export Statements', description: 'Generate audit ledger CSV and PDF reports' },
      { key: PERMISSIONS.LEDGERS_ADJUST, label: 'Post Adjustments', description: 'Apply manual debits, credits, and discounts' },
    ],
  },
  {
    id: 'varieties',
    name: 'Produce Varieties & Rates',
    description: 'Manage fruits, origin states, box counts, and default market rates',
    permissions: [
      { key: PERMISSIONS.VARIETIES_READ, label: 'View Rate Card', description: 'Browse fruit varieties and active market rates' },
      { key: PERMISSIONS.VARIETIES_CREATE, label: 'Add Varieties', description: 'Register new produce items and count sizes' },
      { key: PERMISSIONS.VARIETIES_EDIT, label: 'Update Rates', description: 'Adjust default kg or box prices' },
      { key: PERMISSIONS.VARIETIES_DELETE, label: 'Delete Varieties', description: 'Archive deprecated produce lines' },
    ],
  },
  {
    id: 'reports',
    name: 'Analytics & Financial Reports',
    description: 'Executive dashboards, daily collection metrics, and commodity volume reports',
    permissions: [
      { key: PERMISSIONS.REPORTS_DASHBOARD, label: 'Access Dashboard', description: 'View real-time sales and collection KPIs' },
      { key: PERMISSIONS.REPORTS_VARIETY, label: 'Variety Volume Reports', description: 'Analyze fruit sales by box and kilogram' },
      { key: PERMISSIONS.REPORTS_FINANCIAL, label: 'Financial Audit Reports', description: 'Inspect commissions, market cess, and dues' },
    ],
  },
  {
    id: 'admin',
    name: 'System & Security Governance',
    description: 'Manage users, assign roles, configure permissions, and system settings',
    permissions: [
      { key: PERMISSIONS.USERS_MANAGE, label: 'Manage Team Members', description: 'Invite, suspend, and configure staff accounts' },
      { key: PERMISSIONS.ROLES_MANAGE, label: 'Manage Roles & Permissions', description: 'Customize access control matrices' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'System Settings', description: 'Configure taxes, commission rates, and shop profile' },
    ],
  },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_EDIT,
    PERMISSIONS.INVOICES_EXPORT,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_EDIT,
    PERMISSIONS.LEDGERS_READ,
    PERMISSIONS.LEDGERS_EXPORT,
    PERMISSIONS.VARIETIES_READ,
    PERMISSIONS.VARIETIES_CREATE,
    PERMISSIONS.VARIETIES_EDIT,
    PERMISSIONS.REPORTS_DASHBOARD,
    PERMISSIONS.REPORTS_VARIETY,
    PERMISSIONS.REPORTS_FINANCIAL,
  ],
  cashier: [
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.LEDGERS_READ,
    PERMISSIONS.VARIETIES_READ,
    PERMISSIONS.REPORTS_DASHBOARD,
  ],
  user: [
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.LEDGERS_READ,
    PERMISSIONS.VARIETIES_READ,
    PERMISSIONS.REPORTS_DASHBOARD,
  ],
  viewer: [
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.LEDGERS_READ,
    PERMISSIONS.VARIETIES_READ,
    PERMISSIONS.REPORTS_DASHBOARD,
  ],
};

export const PAYMENT_MODES = {
  CASH: 'Cash',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
};

export const INVOICE_STATUS = {
  PAID: 'Paid',
  PARTIAL: 'Partial',
  UNPAID: 'Unpaid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export const PRODUCE_UNITS = {
  KG: 'Kg',
  BOX: 'Box',
};

export const LEDGER_ENTRY_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
};
