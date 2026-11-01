import { useState, useEffect, useCallback } from 'react';
import {
  Invoice,
  InvoiceStatus,
  Customer,
  ProduceVariety,
  PaymentRecord,
  CustomerLedgerRow,
  PaymentMode,
} from '../types';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-101',
    name: 'Rajesh Traders',
    phone: '+91 98765 43210',
    email: 'rajesh.traders@gmail.com',
    address: 'Shop #14, APMC Market Yard, Bengaluru, KA',
    opening_balance: 15000.00,
    current_balance: 24250.00,
    total_sales: 14250.00,
    total_paid: 5000.00,
    status: 'Active',
    notes: 'Long standing wholesale buyer. Weekly settlement.',
  },
  {
    id: 'cust-102',
    name: 'Golden Supermarket',
    phone: '+91 98450 11223',
    email: 'purchase@goldensupermarket.com',
    address: 'Gandhi Road, T. Nagar, Chennai, TN',
    opening_balance: 8500.00,
    current_balance: 8500.00,
    total_sales: 8560.00,
    total_paid: 8560.00,
    status: 'Active',
    notes: 'Retail chain customer. Prompt bank settlements.',
  },
  {
    id: 'cust-103',
    name: 'Sree Balaji Stores',
    phone: '+91 97401 88990',
    email: 'balajistores@yahoo.com',
    address: 'Market Cross, Begum Bazar, Hyderabad, TS',
    opening_balance: 0.00,
    current_balance: -10000.00,
    total_sales: 0.00,
    total_paid: 10000.00,
    status: 'Active',
    notes: 'Advance paying customer (Credit balance ₹10,000).',
  },
  {
    id: 'cust-104',
    name: 'Metro Fresh Mart',
    phone: '+91 99160 55443',
    email: 'metrofresh@gmail.com',
    address: 'Avinashi Road, Coimbatore, TN',
    opening_balance: -5000.00,
    current_balance: -5000.00,
    total_sales: 0.00,
    total_paid: 0.00,
    status: 'Active',
    notes: 'Pre-season advance deposited.',
  },
  {
    id: 'cust-105',
    name: 'Anand Wholesale Produce',
    phone: '+91 96200 33445',
    email: 'anandproduce@gmail.com',
    address: 'Subzi Mandi, Gultekdi, Pune, MH',
    opening_balance: 22400.00,
    current_balance: 48900.00,
    total_sales: 26500.00,
    total_paid: 0.00,
    status: 'Active',
    notes: 'High-volume trading partner.',
  },
];

export const INITIAL_VARIETIES: ProduceVariety[] = [
  // 1. APPLE - Indian Apple Varieties
  {
    id: 'var-apl-ind-135',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: '135 Count',
    code: 'APL-IND-135',
    name: 'Indian Apple 135 Count',
    default_unit: 'Box',
    default_rate_kg: 95.00,
    default_rate_box: 1850.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-apl-ind-100',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: '100 Count',
    code: 'APL-IND-100',
    name: 'Indian Apple 100 Count',
    default_unit: 'Box',
    default_rate_kg: 105.00,
    default_rate_box: 2100.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-apl-ind-90',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: '90 Count',
    code: 'APL-IND-90',
    name: 'Indian Apple 90 Count (Large)',
    default_unit: 'Box',
    default_rate_kg: 115.00,
    default_rate_box: 2300.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-apl-ind-200',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: '200 (Small)',
    code: 'APL-IND-200',
    name: 'Indian Apple 200 (Small)',
    default_unit: 'Box',
    default_rate_kg: 78.00,
    default_rate_box: 1550.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-apl-ind-250',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: '250 (Extra Small)',
    code: 'APL-IND-250',
    name: 'Indian Apple 250 (Extra Small)',
    default_unit: 'Box',
    default_rate_kg: 68.00,
    default_rate_box: 1350.00,
    is_custom: false,
    is_active: true,
  },

  // 2. APPLE - Green Apple & Red Apple (Turkey, Poland)
  {
    id: 'var-apl-grn-100',
    fruit: 'Apple',
    origin: 'Imported',
    size_count: '100 Count',
    code: 'APL-GRN-100',
    name: 'Green Apple (Granny Smith)',
    default_unit: 'Box',
    default_rate_kg: 130.00,
    default_rate_box: 2400.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-apl-trk-100',
    fruit: 'Apple',
    origin: 'Turkey',
    size_count: '100 Count',
    code: 'APL-TRK-100',
    name: 'Red Apple (Turkey) 100 Count',
    default_unit: 'Box',
    default_rate_kg: 140.00,
    default_rate_box: 2600.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-apl-pol-100',
    fruit: 'Apple',
    origin: 'Poland',
    size_count: '100 Count',
    code: 'APL-POL-100',
    name: 'Red Apple (Poland) 100 Count',
    default_unit: 'Box',
    default_rate_kg: 135.00,
    default_rate_box: 2500.00,
    is_custom: false,
    is_active: true,
  },

  // 3. MALTA - Indian, Australia, Egypt Varieties
  {
    id: 'var-mlt-ind-80',
    fruit: 'Malta',
    origin: 'Indian',
    size_count: '80 Count',
    code: 'MLT-IND-80',
    name: 'Malta Indian 80 Count',
    default_unit: 'Box',
    default_rate_kg: 70.00,
    default_rate_box: 1400.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-mlt-ind-88',
    fruit: 'Malta',
    origin: 'Indian',
    size_count: '88 Count',
    code: 'MLT-IND-88',
    name: 'Malta Indian 88 Count',
    default_unit: 'Box',
    default_rate_kg: 65.00,
    default_rate_box: 1300.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-mlt-aus-88',
    fruit: 'Malta',
    origin: 'Australia',
    size_count: '88 Count',
    code: 'MLT-AUS-88',
    name: 'Malta Australia 88 Count',
    default_unit: 'Box',
    default_rate_kg: 110.00,
    default_rate_box: 1950.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-mlt-egy-80',
    fruit: 'Malta',
    origin: 'Egypt',
    size_count: '80 Count',
    code: 'MLT-EGY-80',
    name: 'Malta Egypt 80 Count',
    default_unit: 'Box',
    default_rate_kg: 95.00,
    default_rate_box: 1750.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-mlt-egy-88',
    fruit: 'Malta',
    origin: 'Egypt',
    size_count: '88 Count',
    code: 'MLT-EGY-88',
    name: 'Malta Egypt 88 Count',
    default_unit: 'Box',
    default_rate_kg: 90.00,
    default_rate_box: 1650.00,
    is_custom: false,
    is_active: true,
  },

  // 4. Shorthand & Loose Varieties
  {
    id: 'var-a1',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: 'Grade A1',
    code: 'A1',
    name: 'Grade A1 Premium Apple',
    default_unit: 'Kg',
    default_rate_kg: 55.00,
    default_rate_box: 1100.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-a2',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: 'Grade A2',
    code: 'A2',
    name: 'Grade A2 Medium Apple',
    default_unit: 'Kg',
    default_rate_kg: 48.00,
    default_rate_box: 960.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-a3',
    fruit: 'Apple',
    origin: 'Indian',
    size_count: 'Grade A3',
    code: 'A3',
    name: 'Grade A3 Standard Apple',
    default_unit: 'Kg',
    default_rate_kg: 42.00,
    default_rate_box: 840.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-spl',
    fruit: 'Apple',
    origin: 'Special',
    size_count: 'SPL Quality',
    code: 'SPL',
    name: 'Special Quality (SPL)',
    default_unit: 'Kg',
    default_rate_kg: 65.00,
    default_rate_box: 1300.00,
    is_custom: false,
    is_active: true,
  },
  {
    id: 'var-loosu',
    fruit: 'General',
    origin: 'Local Mandi',
    size_count: 'Bulk / Loose',
    code: 'Loosu',
    name: 'Loosu (Loose / Bulk Produce)',
    default_unit: 'Kg',
    default_rate_kg: 35.00,
    default_rate_box: 700.00,
    is_custom: false,
    is_active: true,
  },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1001',
    payment_number: 'PAY-2026-001',
    customer_id: 'cust-101',
    customer_name: 'Rajesh Traders',
    invoice_id: 'inv-101',
    invoice_number: 'INV-2026-001',
    amount: 5000.00,
    payment_mode: 'UPI',
    transaction_ref: 'UPI/4291039481@ybl',
    payment_date: today,
    notes: 'Partial settlement via PhonePe.',
  },
  {
    id: 'pay-1002',
    payment_number: 'PAY-2026-002',
    customer_id: 'cust-102',
    customer_name: 'Golden Supermarket',
    invoice_id: 'inv-102',
    invoice_number: 'INV-2026-002',
    amount: 8560.00,
    payment_mode: 'Bank Transfer',
    transaction_ref: 'NEFT/HDFC2910398401',
    payment_date: today,
    notes: 'Full payment for INV-2026-002.',
  },
  {
    id: 'pay-1003',
    payment_number: 'PAY-2026-003',
    customer_id: 'cust-103',
    customer_name: 'Sree Balaji Stores',
    amount: 10000.00,
    payment_mode: 'Cash',
    transaction_ref: 'CASH-REC-01',
    payment_date: yesterday,
    notes: 'Advance deposit for upcoming dispatch.',
  },
];

export const INITIAL_PRODUCE_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-001',
    type: 'sales',
    date: today,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    customerId: 'cust-101',
    partyName: 'Rajesh Traders',
    partyEmail: 'rajesh.traders@gmail.com',
    partyPhone: '+91 98765 43210',
    partyAddress: 'Shop #14, APMC Market Yard, Bengaluru, KA',
    items: [
      { id: 'item-1', description: 'Grade A1 Premium (10 Boxes)', variety: 'A1', unit: 'Box', boxes: 10, weight_kg: 200, quantity: 10, unitPrice: 1100, rate: 1100, amount: 11000 },
      { id: 'item-2', description: 'Special Quality SPL (50 Kg)', variety: 'SPL', unit: 'Kg', boxes: 0, weight_kg: 50, quantity: 50, unitPrice: 65, rate: 65, amount: 3250 },
    ],
    subtotal: 14250,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 14250,
    paidAmount: 5000,
    balanceDue: 9250,
    status: 'Partial',
    paymentMode: 'UPI',
    notes: '10 Boxes A1 delivered via vehicle KA-05-AB-1234. Partial payment received.',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-002',
    type: 'sales',
    date: today,
    dueDate: today,
    customerId: 'cust-102',
    partyName: 'Golden Supermarket',
    partyEmail: 'purchase@goldensupermarket.com',
    partyPhone: '+91 98450 11223',
    partyAddress: 'Gandhi Road, T. Nagar, Chennai, TN',
    items: [
      { id: 'item-3', description: 'Grade A2 Medium (120 Kg)', variety: 'A2', unit: 'Kg', boxes: 0, weight_kg: 120, quantity: 120, unitPrice: 48, rate: 48, amount: 5760 },
      { id: 'item-4', description: 'Loosu Bulk (80 Kg)', variety: 'Loosu', unit: 'Kg', boxes: 0, weight_kg: 80, quantity: 80, unitPrice: 35, rate: 35, amount: 2800 },
    ],
    subtotal: 8560,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 8560,
    paidAmount: 8560,
    balanceDue: 0,
    status: 'Paid',
    paymentMode: 'Bank Transfer',
    notes: 'Settled immediately via NEFT.',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-003',
    type: 'sales',
    date: yesterday,
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    customerId: 'cust-105',
    partyName: 'Anand Wholesale Produce',
    partyEmail: 'anandproduce@gmail.com',
    partyPhone: '+91 96200 33445',
    partyAddress: 'Subzi Mandi, Gultekdi, Pune, MH',
    items: [
      { id: 'item-5', description: 'Grade A3 Standard (25 Boxes)', variety: 'A3', unit: 'Box', boxes: 25, weight_kg: 500, quantity: 25, unitPrice: 840, rate: 840, amount: 21000 },
      { id: 'item-6', description: 'Grade A1 Premium (100 Kg)', variety: 'A1', unit: 'Kg', boxes: 0, weight_kg: 100, quantity: 100, unitPrice: 55, rate: 55, amount: 5500 },
    ],
    subtotal: 26500,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 26500,
    paidAmount: 0,
    balanceDue: 26500,
    status: 'Pending',
    paymentMode: 'Cash',
    notes: 'Consignment shipment sent via interstate truck.',
  },
];

export const INITIAL_CUSTOMER_LEDGER: CustomerLedgerRow[] = [
  {
    id: 'led-1',
    customer_id: 'cust-101',
    customer_name: 'Rajesh Traders',
    date: '2026-10-01',
    reference: 'OPENING',
    description: 'Opening Balance (Previous season carry-forward)',
    debit: 15000.00,
    credit: 0.00,
    running_balance: 15000.00,
    type: 'opening',
  },
  {
    id: 'led-2',
    customer_id: 'cust-101',
    customer_name: 'Rajesh Traders',
    date: today,
    reference: 'INV-2026-001',
    description: 'Sales Bill: 10 Boxes A1, 50 Kg SPL',
    debit: 14250.00,
    credit: 0.00,
    running_balance: 29250.00,
    type: 'invoice',
  },
  {
    id: 'led-3',
    customer_id: 'cust-101',
    customer_name: 'Rajesh Traders',
    date: today,
    reference: 'PAY-2026-001',
    description: 'Partial Payment Received via UPI (Ref: UPI/4291039481@ybl)',
    debit: 0.00,
    credit: 5000.00,
    running_balance: 24250.00,
    type: 'payment',
  },
  {
    id: 'led-4',
    customer_id: 'cust-102',
    customer_name: 'Golden Supermarket',
    date: '2026-10-01',
    reference: 'OPENING',
    description: 'Opening Balance',
    debit: 8500.00,
    credit: 0.00,
    running_balance: 8500.00,
    type: 'opening',
  },
  {
    id: 'led-5',
    customer_id: 'cust-102',
    customer_name: 'Golden Supermarket',
    date: today,
    reference: 'INV-2026-002',
    description: 'Sales Bill: 120 Kg A2, 80 Kg Loosu',
    debit: 8560.00,
    credit: 0.00,
    running_balance: 17060.00,
    type: 'invoice',
  },
  {
    id: 'led-6',
    customer_id: 'cust-102',
    customer_name: 'Golden Supermarket',
    date: today,
    reference: 'PAY-2026-002',
    description: 'Payment via Bank Transfer (NEFT/HDFC2910398401)',
    debit: 0.00,
    credit: 8560.00,
    running_balance: 8500.00,
    type: 'payment',
  },
];

const STORAGE_PREFIX = 'kbn_produce_v3_';

export function useLedgerStore() {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [varieties, setVarieties] = useState<ProduceVariety[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'varieties');
      return saved ? JSON.parse(saved) : INITIAL_VARIETIES;
    } catch {
      return INITIAL_VARIETIES;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'invoices');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCE_INVOICES;
    } catch {
      return INITIAL_PRODUCE_INVOICES;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'payments');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [customerLedger, setCustomerLedger] = useState<CustomerLedgerRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'customer_ledger');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_LEDGER;
    } catch {
      return INITIAL_CUSTOMER_LEDGER;
    }
  });

  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
      localStorage.setItem(STORAGE_PREFIX + 'varieties', JSON.stringify(varieties));
      localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
      localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(payments));
      localStorage.setItem(STORAGE_PREFIX + 'customer_ledger', JSON.stringify(customerLedger));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [customers, varieties, invoices, payments, customerLedger]);

  // Sync with Backend Sequelize API on Mount
  const refreshFromBackend = useCallback(async () => {
    try {
      const [custRes, varRes, invRes, payRes] = await Promise.allSettled([
        api.getCustomers(),
        api.getVarieties(),
        api.getInvoices(),
        api.getPayments(),
      ]);

      if (custRes.status === 'fulfilled' && custRes.value.data?.data) {
        setCustomers(custRes.value.data.data);
      }
      if (varRes.status === 'fulfilled' && varRes.value.data?.data) {
        setVarieties(varRes.value.data.data);
      }
      if (invRes.status === 'fulfilled' && invRes.value.data?.data) {
        const backendInvs = invRes.value.data.data.map((i: any) => ({
          ...i,
          invoiceNumber: i.invoice_number || i.invoiceNumber,
          partyName: i.customer_name || i.partyName,
          partyPhone: i.customer_phone || i.partyPhone,
          partyAddress: i.customer_address || i.partyAddress,
          total: Number(i.total_amount || i.total || 0),
          paidAmount: Number(i.paid_amount || i.paidAmount || 0),
          balanceDue: Number(i.balance_due || i.balanceDue || 0),
        }));
        setInvoices(backendInvs);
      }
      if (payRes.status === 'fulfilled' && payRes.value.data?.data) {
        setPayments(payRes.value.data.data);
      }
    } catch (err) {
      console.log('Operating in local-first synced state:', err);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Customer Management
  const addCustomer = async (customerData: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    opening_balance?: number;
    notes?: string;
  }) => {
    const openingBal = Number(customerData.opening_balance) || 0;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email || '',
      address: customerData.address || '',
      opening_balance: openingBal,
      current_balance: openingBal,
      total_sales: 0,
      total_paid: 0,
      status: 'Active',
      notes: customerData.notes || '',
    };

    setCustomers((prev) => [newCust, ...prev]);

    if (openingBal !== 0) {
      const openEntry: CustomerLedgerRow = {
        id: `led-${Date.now()}`,
        customer_id: newCust.id,
        customer_name: newCust.name,
        date: today,
        reference: 'OPENING',
        description: 'Opening Balance (Carry-forward)',
        debit: openingBal > 0 ? openingBal : 0,
        credit: openingBal < 0 ? Math.abs(openingBal) : 0,
        running_balance: openingBal,
        type: 'opening',
      };
      setCustomerLedger((prev) => [openEntry, ...prev]);
    }

    try {
      await api.createCustomer(customerData);
    } catch {
      // already updated optimistically
    }
    toast.success(`Customer ${customerData.name} registered successfully.`);
    return newCust;
  };

  const updateCustomer = async (id: string, updatedFields: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    try {
      await api.updateCustomer(id, updatedFields);
    } catch {
      // optimistic
    }
    toast.success('Customer profile updated.');
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteCustomer(id);
    } catch {
      // optimistic
    }
    toast.success('Customer deleted.');
  };

  // Variety Management
  const addVariety = async (data: {
    fruit?: string;
    origin?: string;
    size_count?: string;
    code: string;
    name: string;
    default_unit: 'Kg' | 'Box';
    default_rate_kg: number;
    default_rate_box: number;
  }) => {
    const newVar: ProduceVariety = {
      id: `var-${Date.now()}`,
      fruit: data.fruit || 'Apple',
      origin: data.origin || 'Indian',
      size_count: data.size_count || 'Standard',
      code: data.code.toUpperCase(),
      name: data.name,
      default_unit: data.default_unit,
      default_rate_kg: Number(data.default_rate_kg) || 0,
      default_rate_box: Number(data.default_rate_box) || 0,
      is_custom: true,
      is_active: true,
    };

    setVarieties((prev) => [...prev, newVar]);
    try {
      await api.createVariety(data);
    } catch {
      // optimistic
    }
    toast.success(`Variety ${newVar.code} added.`);
    return newVar;
  };

  const updateVariety = async (id: string, updatedFields: Partial<ProduceVariety>) => {
    setVarieties((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    try {
      await api.updateVariety(id, updatedFields);
    } catch {
      // optimistic
    }
    toast.success('Variety rates updated.');
  };

  const deleteVariety = async (id: string) => {
    setVarieties((prev) => prev.filter((v) => v.id !== id));
    try {
      await api.deleteVariety(id);
    } catch {
      // optimistic
    }
    toast.success('Variety removed successfully.');
  };

  // Payment Management (Cash, UPI, Bank Transfer)
  const addPayment = async (data: {
    customerId: string;
    customerName: string;
    invoiceId?: string;
    invoiceNumber?: string;
    amount: number;
    paymentMode: PaymentMode;
    transactionRef?: string;
    paymentDate?: string;
    notes?: string;
  }) => {
    const amt = Number(data.amount);
    const dateStr = data.paymentDate || today;
    const paymentNum = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      payment_number: paymentNum,
      customer_id: data.customerId,
      customer_name: data.customerName,
      invoice_id: data.invoiceId,
      invoice_number: data.invoiceNumber,
      amount: amt,
      payment_mode: data.paymentMode,
      transaction_ref: data.transactionRef || '',
      payment_date: dateStr,
      notes: data.notes || '',
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update customer balance & total_paid
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === data.customerId) {
          const newBal = Number(c.current_balance) - amt;
          const newPaid = Number(c.total_paid) + amt;
          return { ...c, current_balance: newBal, total_paid: newPaid };
        }
        return c;
      })
    );

    // If invoice linked, update invoice
    if (data.invoiceId) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === data.invoiceId) {
            const newPaid = Number(inv.paidAmount || 0) + amt;
            const newBal = Math.max(0, Number(inv.total) - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              balanceDue: newBal,
              status: newBal === 0 ? 'Paid' : 'Partial',
            };
          }
          return inv;
        })
      );
    }

    // Add Credit row to Customer Ledger
    const targetCust = customers.find((c) => c.id === data.customerId);
    const newBal = (targetCust ? Number(targetCust.current_balance) : 0) - amt;
    const desc = data.invoiceNumber
      ? `Payment via ${data.paymentMode} for ${data.invoiceNumber} ${data.transactionRef ? `(${data.transactionRef})` : ''}`
      : `Payment Received via ${data.paymentMode} ${data.transactionRef ? `(${data.transactionRef})` : ''}`;

    const newLedgerRow: CustomerLedgerRow = {
      id: `led-${Date.now()}`,
      customer_id: data.customerId,
      customer_name: data.customerName,
      date: dateStr,
      reference: paymentNum,
      description: desc,
      debit: 0,
      credit: amt,
      running_balance: newBal,
      type: 'payment',
    };
    setCustomerLedger((prev) => [...prev, newLedgerRow]);

    try {
      await api.createPayment(data);
    } catch {
      // optimistic
    }
    toast.success(`Payment of ₹${amt.toLocaleString('en-IN')} via ${data.paymentMode} recorded.`);
    return newPayment;
  };

  // Multi-Variety Produce Billing
  const addProduceInvoice = async (invoiceData: any) => {
    const rawItems = invoiceData.items || [];
    const subtotal = rawItems.reduce((sum: number, it: any) => sum + (Number(it.amount) || 0), 0);
    const discount = Number(invoiceData.discount) || 0;
    const grandTotal = Math.max(0, subtotal - discount);
    const paid = Number(invoiceData.paidAmount) || 0;
    const balanceDue = Math.max(0, grandTotal - paid);

    let status: InvoiceStatus = 'Pending';
    if (paid >= grandTotal && grandTotal > 0) status = 'Paid';
    else if (paid > 0 && paid < grandTotal) status = 'Partial';

    const invNum = invoiceData.invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const invId = `inv-${Date.now()}`;
    const invDate = invoiceData.date || today;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber: invNum,
      type: 'sales',
      date: invDate,
      dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      customerId: invoiceData.customerId,
      partyName: invoiceData.customerName,
      partyPhone: invoiceData.customerPhone || '',
      partyEmail: invoiceData.customerEmail || '',
      partyAddress: invoiceData.customerAddress || '',
      items: rawItems,
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      discount,
      total: grandTotal,
      paidAmount: paid,
      balanceDue,
      status,
      paymentMode: invoiceData.paymentMode || 'Cash',
      notes: invoiceData.notes || '',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update customer current_balance & total_sales
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === invoiceData.customerId || c.name === invoiceData.customerName) {
          const newBal = Number(c.current_balance) + balanceDue;
          const newSales = Number(c.total_sales) + grandTotal;
          const newPaid = Number(c.total_paid) + paid;
          return { ...c, current_balance: newBal, total_sales: newSales, total_paid: newPaid };
        }
        return c;
      })
    );

    // Ledger Debit Entry for Invoice
    const targetCust = customers.find((c) => c.id === invoiceData.customerId);
    const startingBal = targetCust ? Number(targetCust.current_balance) : 0;
    const runningAfterBill = startingBal + grandTotal;

    const varietySummary = rawItems
      .map((it: any) => `${it.variety} (${it.unit === 'Box' ? `${it.boxes} Box` : `${it.weight_kg} Kg`})`)
      .join(', ');

    const billLedgerEntry: CustomerLedgerRow = {
      id: `led-${Date.now()}-inv`,
      customer_id: invoiceData.customerId || `cust-${Date.now()}`,
      customer_name: invoiceData.customerName,
      date: invDate,
      reference: invNum,
      description: `Sales Bill: ${varietySummary}`,
      debit: grandTotal,
      credit: 0,
      running_balance: runningAfterBill,
      type: 'invoice',
    };

    setCustomerLedger((prev) => [...prev, billLedgerEntry]);

    // If paid at time of billing, also add payment & ledger credit
    if (paid > 0) {
      const payNum = `PAY-${Date.now().toString().slice(-4)}`;
      const newPay: PaymentRecord = {
        id: `pay-${Date.now()}`,
        payment_number: payNum,
        customer_id: invoiceData.customerId,
        customer_name: invoiceData.customerName,
        invoice_id: invId,
        invoice_number: invNum,
        amount: paid,
        payment_mode: invoiceData.paymentMode || 'Cash',
        transaction_ref: invoiceData.transactionRef || `${invoiceData.paymentMode} on Bill`,
        payment_date: invDate,
        notes: `Settlement on invoice ${invNum}`,
      };
      setPayments((prev) => [newPay, ...prev]);

      const payLedgerEntry: CustomerLedgerRow = {
        id: `led-${Date.now()}-pay`,
        customer_id: invoiceData.customerId,
        customer_name: invoiceData.customerName,
        date: invDate,
        reference: payNum,
        description: `Payment Received via ${invoiceData.paymentMode || 'Cash'} for ${invNum}`,
        debit: 0,
        credit: paid,
        running_balance: runningAfterBill - paid,
        type: 'payment',
      };
      setCustomerLedger((prev) => [...prev, payLedgerEntry]);
    }

    try {
      await api.createInvoice(invoiceData);
    } catch {
      // optimistic
    }
    toast.success(`Multi-variety bill ${invNum} generated successfully!`);
    return newInvoice;
  };

  // Customer Ledger Statement Getter
  const getCustomerLedgerStatement = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    const rows = customerLedger.filter((l) => l.customer_id === customerId);
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = 0;
    const computedRows = rows.map((r) => {
      const debit = Number(r.debit) || 0;
      const credit = Number(r.credit) || 0;
      running = running + debit - credit;
      return {
        ...r,
        debit,
        credit,
        running_balance: running,
      };
    });

    const totalDebit = computedRows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = computedRows.reduce((sum, r) => sum + r.credit, 0);

    return {
      customer: cust,
      rows: computedRows,
      totalDebit,
      totalCredit,
      currentBalance: cust ? Number(cust.current_balance) : running,
    };
  };

  // Dashboard Aggregates
  const todayStr = today;
  const yesterdayStr = yesterday;

  const dailySales = invoices
    .filter((inv) => inv.date === todayStr)
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const yesterdaySales = invoices
    .filter((inv) => inv.date === yesterdayStr)
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const todayPayments = payments.filter((p) => p.payment_date === todayStr);
  const dailyCollections = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCollections = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const collectionsByMode = {
    cash: payments.filter((p) => p.payment_mode === 'Cash').reduce((sum, p) => sum + Number(p.amount), 0),
    upi: payments.filter((p) => p.payment_mode === 'UPI').reduce((sum, p) => sum + Number(p.amount), 0),
    bank: payments.filter((p) => p.payment_mode === 'Bank Transfer').reduce((sum, p) => sum + Number(p.amount), 0),
  };

  const totalCustomerDues = customers
    .filter((c) => Number(c.current_balance) > 0)
    .reduce((sum, c) => sum + Number(c.current_balance), 0);

  const totalCustomerAdvances = customers
    .filter((c) => Number(c.current_balance) < 0)
    .reduce((sum, c) => sum + Math.abs(Number(c.current_balance)), 0);

  // Variety-wise Sales breakdown
  const varietySalesStats: Record<string, { code: string; name: string; totalKg: number; totalBoxes: number; revenue: number }> = {};
  varieties.forEach((v) => {
    varietySalesStats[v.code] = { code: v.code, name: v.name, totalKg: 0, totalBoxes: 0, revenue: 0 };
  });

  invoices.forEach((inv) => {
    if (Array.isArray(inv.items)) {
      inv.items.forEach((it: any) => {
        const code = it.variety || 'A1';
        if (!varietySalesStats[code]) {
          varietySalesStats[code] = { code, name: code, totalKg: 0, totalBoxes: 0, revenue: 0 };
        }
        if (it.unit === 'Box') {
          varietySalesStats[code].totalBoxes += Number(it.boxes) || 0;
          if (it.weight_kg) varietySalesStats[code].totalKg += Number(it.weight_kg) || 0;
        } else {
          varietySalesStats[code].totalKg += Number(it.weight_kg) || Number(it.quantity) || 0;
        }
        varietySalesStats[code].revenue += Number(it.amount) || 0;
      });
    }
  });

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const resetToDefaults = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setVarieties(INITIAL_VARIETIES);
    setInvoices(INITIAL_PRODUCE_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setCustomerLedger(INITIAL_CUSTOMER_LEDGER);
    localStorage.clear();
    toast.success('Reset to demo Mandi trading data.');
  };

  return {
    // KBN Traders State
    customers,
    varieties,
    invoices,
    payments,
    customerLedger,
    currencySymbol,
    setCurrencySymbol,

    // KBN Traders Actions
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addVariety,
    updateVariety,
    deleteVariety,
    addPayment,
    addProduceInvoice,
    getCustomerLedgerStatement,
    refreshFromBackend,
    updateInvoiceStatus,
    deleteInvoice,
    resetToDefaults,

    // Dashboard metrics
    dailySales,
    yesterdaySales,
    totalSales,
    dailyCollections,
    totalCollections,
    collectionsByMode,
    totalCustomerDues,
    totalCustomerAdvances,
    varietySales: Object.values(varietySalesStats),
  };
}
