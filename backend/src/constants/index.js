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
  USER: 'user',
  VIEWER: 'viewer',
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
  DEBIT: 'debit',     // Billed sale, customer owes us
  CREDIT: 'credit',   // Payment received or credit adjustment
};

